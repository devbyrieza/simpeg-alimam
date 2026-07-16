# Final Fix: Correct Port Configuration

Based on your screenshot, here is exactly what you need to enter.

## 1. Configure Ports
Go to your Coolify Configuration -> General.

*   **Ports Exposes**: `3000`
    *   (Remove the Quotes and the colon. Just the number).
*   **Port Mappings**: `3000:3000`
    *   (Enter this in the second box which is currently empty).

## 2. Save and Redeploy
1.  Click **Save**.
2.  Click **Redeploy**.

## 3. Verify
Once the deployment finishes, the invalid syntax error will be gone, and shortly after, Nginx will be able to connect to `localhost:3000`, bringing your site online permanently.
