# Final Step: Redeploy with Port Mapping

You have successfully updated the Nginx configuration.
However, the application is not yet listening on port 3000, so the site is currently giving a 502 error.

## Action Required

1.  **Configure Coolify**:
    *   Go to your Coolify Dashboard -> Application Settings.
    *   Find **"Ports Exposes"**.
    *   Add: `3000:3000`
    *   Click **Save**.

2.  **Redeploy**:
    *   Click the **Redeploy** button in Coolify.

Once the deployment finishes, the application will start listening on port 3000, and Nginx (which is already configured) will connect automatically. This will permanently solve the 502 issue.
