import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json({ success: false, error: "Akses tidak diizinkan" }, { status: 403 });
    }

    const { nominal } = await request.json();
    if (!nominal || typeof nominal !== "number" || nominal < 10000) {
      return NextResponse.json({ success: false, error: "Nominal topup minimal Rp 10.000" }, { status: 400 });
    }

    const dompet = await prisma.dompetSantri.findUnique({
      where: { pendaftar_id: session.id },
      include: { pendaftar: { include: { tahun_ajaran: true } } }
    });

    if (!dompet) {
      return NextResponse.json({ success: false, error: "Dompet Santri belum aktif" }, { status: 404 });
    }

    if (dompet.status !== "AKTIF") {
      return NextResponse.json({ success: false, error: "Dompet sedang diblokir" }, { status: 400 });
    }

    // Cek batas maksimal saldo dihapus agar unlimited sesuai request

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    if (!serverKey) {
      return NextResponse.json({ success: false, error: "Gateway belum dikonfigurasi" }, { status: 500 });
    }

    const timestamp = Date.now();
    const orderId = `TOPUP-${dompet.pendaftar.nomor_pendaftaran}-${timestamp}`;

    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: nominal,
      },
      item_details: [
        {
          id: "TOPUP_DOMPET",
          price: nominal,
          quantity: 1,
          name: `Top Up Kartu Jajan - ${dompet.pendaftar.nama_lengkap}`,
        },
      ],
      customer_details: {
        first_name: dompet.pendaftar.nama_lengkap,
        email: dompet.pendaftar.email || "noemail@ponpesalimam.sch.id",
        phone: dompet.pendaftar.no_hp || "",
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/pendaftar/kartu-jajan?status=finish`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/pendaftar/kartu-jajan?status=error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/pendaftar/kartu-jajan?status=pending`,
      },
      expiry: {
        unit: "hours",
        duration: 24, // 24 hours expiry for topup
      },
    };

    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const authString = Buffer.from(serverKey + ":").toString("base64");

    const midtransResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(transactionData),
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok || !midtransData.token) {
      console.error("Midtrans topup error:", midtransData);
      return NextResponse.json({ success: false, error: "Gagal membuat transaksi" }, { status: 500 });
    }

    // Create Pembayaran with jenis TOPUP_DOMPET
    const insertedPayment = await prisma.pembayaran.create({
      data: {
        pendaftar_id: session.id,
        tahun_ajaran_id: dompet.pendaftar.tahun_ajaran_id,
        metode_pembayaran: "midtrans",
        jumlah: nominal,
        jenis_pembayaran: "TOPUP_DOMPET",
        midtrans_order_id: orderId,
        midtrans_response_json: midtransData,
        status_pembayaran: "pending",
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi topup berhasil dibuat",
      data: {
        pembayaran_id: insertedPayment.id,
        order_id: orderId,
        snap_token: midtransData.token,
        redirect_url: midtransData.redirect_url,
        gross_amount: nominal,
      },
    });
  } catch (error: any) {
    console.error("Error creating topup:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
