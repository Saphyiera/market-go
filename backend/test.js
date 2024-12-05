const fetchStatistics = async () => {
    const userId = 0; // Replace with the actual user ID
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    // Format the dates to YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(oneMonthAgo);
    const endDate = formatDate(currentDate);

    try {
        const response = await fetch(`http://localhost:2811/statistic?userId=${userId}&startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Statistics data:', data);
        } else {
            console.error('Error fetching statistics:', data.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

fetchStatistics();
