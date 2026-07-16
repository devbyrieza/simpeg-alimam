/**
 * Script to get magic links with tinyurls for all examiners and interviewers
 * Calls the existing API endpoint to avoid database connection issues
 * Run with: node scripts/generate-magic-links.js
 */

const API_BASE = 'https://pesantren-alimam.com';
const CRON_SECRET = 'ppdb-alimam-cron-2026'; // You may need to adjust this

async function getMagicLinks() {
    try {
        console.log('🔮 Fetching magic links for examiners and interviewers...\n');

        // Call the existing API endpoint
        const response = await fetch(`${API_BASE}/api/admin/users/magic-link?secret=${CRON_SECRET}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success || !data.data) {
            throw new Error('Invalid API response');
        }

        const results = data.data;

        console.log(`✅ Found ${results.length} examiners/interviewers\n`);

        for (const user of results) {
            console.log(`📋 ${user.full_name}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Secondary Roles: ${user.secondary_roles?.join(', ') || 'None'}`);
            console.log(`   Magic Link: ${user.link}`);
            console.log(`   TinyURL: ${user.shortLink}`);
            console.log(`   Permanent Link: ${user.permanentLink || 'None'}`);
            console.log('');
        }

        // Save results to file
        const fs = require('fs');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `magic-links-${timestamp}.json`;
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`📁 Results saved to: ${filename}`);

        console.log(`🎉 Generated ${results.length} magic links with tinyurls!`);

    } catch (error) {
        console.error('❌ Error fetching magic links:', error.message);
        console.log('\n💡 Alternative: Open this URL in browser with admin session:');
        console.log(`${API_BASE}/api/admin/users/magic-link`);
        process.exit(1);
    }
}

getMagicLinks();
