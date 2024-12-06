const { User } = require("../models/user");
const https = require('https');
exports.getUserStatusReport = async (req, res) => {
    try {
        // Get all user statuses (for example: "active", "inactive", etc.)
        const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED']; // Add more as needed
        
        const report = {};

        // Iterate through each status and fetch corresponding users
        for (const status of statuses) {
            const users = await User.find({ status: status }).select('username');  // Get usernames of users with specific status

            // If there are users for this status, add them to the report
            if (users.length > 0) {
                report[status] = {
                    total: users.length,
                    usernames: users.map(user => user.username) // Extract usernames
                };
            } else {
                report[status] = {
                    total: 0,
                    usernames: []
                };
            }
        }

        // Return the report with total users and their usernames by status
        return res.status(200).json({
            message: "User status report fetched successfully",
            report
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching user status report", error: error.message });
    }
};

const si = require('systeminformation');
const exec = require('child_process').exec;
exports.getSystemPerformance = async (req, res) => {
    try {
        // Execute the commands to get system information
        const getDiskUsage = () => {
            return new Promise((resolve, reject) => {
                exec('df -h | grep "/$"', (error, stdout, stderr) => {
                    if (error || stderr) return reject('Error fetching disk usage');
                    const match = stdout.split(/\s+/);
                    if (match.length < 5) return reject('Error parsing disk usage');
                    resolve({
                        total: match[1],
                        used: match[2],
                        available: match[3],
                        capacity: match[4]
                    });
                });
            });
        };

        const getMemoryUsage = () => {
            return new Promise((resolve, reject) => {
                exec('top -l 1 -s 0 | grep "PhysMem"', (error, stdout, stderr) => {
                    if (error || stderr) return reject('Error fetching memory usage');
                    // Return the full output of the 'top' command for memory usage
                    resolve(stdout.trim());
                });
            });
        };

        const getCPUUsage = () => {
            return new Promise((resolve, reject) => {
                exec('top -l 1 -s 0 | grep "CPU usage"', (error, stdout, stderr) => {
                    if (error || stderr) return reject('Error fetching CPU usage');
                    const match = stdout.match(/CPU usage: (\d+\.\d+)% user/);
                    resolve(match ? `${match[1]}% CPU usage` : 'CPU data unavailable');
                });
            });
        };

        const getUptime = () => {
            return new Promise((resolve, reject) => {
                exec('uptime', (error, stdout, stderr) => {
                    if (error || stderr) return reject('Error fetching uptime');
                    const match = stdout.match(/up\s+(\d+)\s+days?/);
                    resolve(match ? `${match[1]} days` : 'Uptime data unavailable');
                });
            });
        };

        const getNetworkInfo = () => {
            return new Promise((resolve, reject) => {
                // Fetch external IP address from a public service
                https.get('https://api.ipify.org?format=json', (response) => {
                    let data = '';
                    response.on('data', chunk => {
                        data += chunk;
                    });
                    response.on('end', () => {
                        try {
                            const ipData = JSON.parse(data);
                            resolve(`IP Address: ${ipData.ip}`);
                        } catch (err) {
                            resolve('Network data unavailable');
                        }
                    });
                }).on('error', () => {
                    resolve('Network data unavailable');
                });
            });
        };

        // Collect all system performance metrics in parallel
        const [diskUsage, memoryUsage, cpuUsage, uptimeInfo, networkInfo] = await Promise.all([
            getDiskUsage(),
            getMemoryUsage(),
            getCPUUsage(),
            getUptime(),
            getNetworkInfo()
        ]);

        // Prepare a compact response
        const performanceData = {
            disk_usage: `Total: ${diskUsage.total}, Used: ${diskUsage.used}, Available: ${diskUsage.available}, Capacity: ${diskUsage.capacity}`,
            memory_usage: memoryUsage, // Returning the complete top command output
            cpu_usage: cpuUsage,
            uptime_info: uptimeInfo,
            network_info: networkInfo
        };

        // Return the compact response
        return res.status(200).json({
            message: "System performance data fetched successfully.",
            data: performanceData
        });

    } catch (error) {
        // Handle errors gracefully
        return res.status(500).json({
            message: "Error fetching system performance data.",
            error: error.message
        });
    }
};