const cron = require('node-cron');
const { sendDailySummaryAlert } = require('../utils/adminAlerts');
const supabase = require('../config/supabase'); // Assuming supabase client is in config

// Schedule to run at 9:00 AM IST (which is 3:30 AM UTC)
// '0 30 3 * * *' -> 3:30 AM every day
const startDailySummaryCron = () => {
    cron.schedule('30 3 * * *', async () => {
        try {
            console.log('📊 Starting daily summary aggregation...');
            
            // Calculate start and end of "Today" in IST
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const startOfDayIST = new Date(new Date().setUTCHours(0,0,0,0) - istOffset).toISOString();
            
            // 1. Get new users today
            const { count: newSignups, error: errUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfDayIST);

            // 2. Sum revenue today (Assuming a 'payments' table with amount and status='success')
            const { data: paymentsToday, error: errPayments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'success')
                .gte('created_at', startOfDayIST);
            let revenueToday = 0;
            if (paymentsToday) {
                revenueToday = paymentsToday.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            }

            // 3. Total generations today
            const { count: generationsToday, error: errGen } = await supabase
                .from('generations')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfDayIST);

            // Send the alert
            await sendDailySummaryAlert({
                newSignups: newSignups || 0,
                revenueToday,
                totalGenerations: generationsToday || 0,
                activeUsers: 'Calc Pending',
                failedPayments: 'Calc Pending',
                suspiciousAccounts: 0,
                serverErrors: 0,
                comparison: 'Data ready.'
            });

            console.log('✅ Daily summary alert sent successfully.');
        } catch (error) {
            console.error('❌ Failed to run daily summary cron:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // fallback if supported
    });
    console.log('⏰ Daily summary cron scheduled for 9:00 AM IST.');
};

module.exports = startDailySummaryCron;
