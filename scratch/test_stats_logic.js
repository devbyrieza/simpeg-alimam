
function testLogic() {
  const mockPendaftarData = [
    { jenis_kelamin: "L", provinsi: "JAWA BARAT", status_pendaftaran: "draft", jenjang: "MTs" },
    { jenis_kelamin: "P", provinsi: "jawa tengah", status_pendaftaran: "paid", jenjang: "IL" },
    { jenis_kelamin: "Laki-laki", provinsi: "DKI JAKARTA", status_pendaftaran: "accepted", jenjang: "MTs" },
    { jenis_kelamin: "Perempuan", provinsi: null, status_pendaftaran: "draft", jenjang: "MTs" },
  ];

  const genderCounts = { "Laki-laki": 0, "Perempuan": 0 };
  const provinsiCounts = {};
  const statusCounts = {};

  mockPendaftarData.forEach((item) => {
    const status = item.status_pendaftaran;
    const jenjang = item.jenjang || "Unknown";
    
    // Normalize Provinsi
    let provinsi = item.provinsi || "Tidak Diketahui";
    if (provinsi && provinsi !== "Tidak Diketahui") {
      // Normalize to Title Case (e.g., JAWA BARAT -> Jawa Barat)
      provinsi = provinsi.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    
    // Normalize Gender mapping (L/P -> Laki-laki/Perempuan)
    let gender = item.jenis_kelamin || "Unknown";
    if (gender === "L") gender = "Laki-laki";
    if (gender === "P") gender = "Perempuan";

    // Status counts
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    // Provinsi counts
    provinsiCounts[provinsi] = (provinsiCounts[provinsi] || 0) + 1;

    // Gender counts
    if (gender === "Laki-laki" || gender === "Perempuan") {
      genderCounts[gender] += 1;
    }
  });

  console.log("Gender Counts:", genderCounts);
  console.log("Provinsi Counts:", provinsiCounts);
  console.log("Status Counts:", statusCounts);

  // Assertions
  if (genderCounts["Laki-laki"] !== 2) throw new Error("Laki-laki count wrong");
  if (genderCounts["Perempuan"] !== 2) throw new Error("Perempuan count wrong");
  if (provinsiCounts["Jawa Barat"] !== 1) throw new Error("Jawa Barat normalization wrong");
  if (provinsiCounts["Jawa Tengah"] !== 1) throw new Error("Jawa Tengah normalization wrong");
  if (provinsiCounts["Tidak Diketahui"] !== 1) throw new Error("Null province handling wrong");
  
  console.log("✅ All tests passed!");
}

testLogic();
