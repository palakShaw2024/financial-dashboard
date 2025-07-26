document.addEventListener('DOMContentLoaded', () => {
    // --- Initializing Elements ---
    const totalMoneyDisplay = document.getElementById('totalMoney');
    const lastUpdatedSpan = document.getElementById('lastUpdated');
    const updateBalanceInput = document.getElementById('balanceInput');
    const updateBalanceBtn = document.getElementById('updateBalanceBtn');
    const currencyConverter = document.querySelector('.currency-convert');

    const familyContributionBtn = document.querySelector('section[name="family-related"] .add-btn');
    const familyContributionSection = document.querySelector('section[name="family-related"] > div > div');
    const familyMemberNameInput = familyContributionSection.querySelector('input[placeholder="Member Name"]');
    const familyMemberValueInput = familyContributionSection.querySelector('input[placeholder=" Value"]');
    const familyMemberColorInput = familyContributionSection.querySelector('input[type="color"]');
    const addFamilyMemberBtn = document.getElementById('add-Btn');
    const familyMembersList = document.createElement('ul'); // New: List for family members
    familyMembersList.id = 'familyMembersList';
    familyContributionSection.parentNode.insertBefore(familyMembersList, familyContributionSection.nextSibling);


    const assetDropdowns = document.querySelectorAll('section.card .dropdown');
    const newAssetNameInput = document.getElementById('newAssetName');
    const newAssetValueInput = document.getElementById('newAssetValue');
    const newAssetColorInput = document.getElementById('newAssetColor');
    const addCustomAssetBtn = document.getElementById('addAssetBtn');
    const assetsList = document.createElement('ul'); // New: List for assets
    assetsList.id = 'assetsList';
    document.querySelector('section.card').appendChild(assetsList); // Append to the asset allocation section

    const assetPieChartContainer = document.getElementById('assetPieChart');
    let assetChart; // To hold our Chart.js instance

    // --- Data Storage (No localStorage for persistence) ---
    // Data will now reset on page reload
    let financialData = {
        totalNetWorth: 0,
        assets: {}, // { "Asset Name": { value: 1000, color: "#RRGGBB" }, ... }
        familyContributions: {}, // { "Member Name": { value: 500, color: "#RRGGBB" }, ... }
        currency: 'INR',
        lastUpdated: new Date().toLocaleDateString()
    };

    // --- Helper Functions ---

    // Function to render the total net worth
    const renderNetWorth = () => {
        totalMoneyDisplay.textContent = `${financialData.currency} ${financialData.totalNetWorth.toLocaleString('en-IN')}`;
        lastUpdatedSpan.textContent = financialData.lastUpdated;
    };

    // Function to calculate percentages for a given object (assets or family) relative to the totalNetWorth
    const calculateRelativePercentages = (dataObject, totalBase) => {
        return Object.entries(dataObject).map(([name, item]) => ({
            label: name,
            value: item.value,
            percentage: totalBase === 0 ? 0 : (item.value / totalBase) * 100,
            color: item.color
        }));
    };

    // Function to update the total net worth
    const updateTotalNetWorth = () => {
        financialData.lastUpdated = new Date().toLocaleDateString();
        renderNetWorth();
        // Removed saveData()
    };

    // Function to render the list of assets
    const renderAssetsList = () => {
        assetsList.innerHTML = ''; // Clear previous list
        const assetData = calculateRelativePercentages(financialData.assets, financialData.totalNetWorth);
        assetData.forEach(asset => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${asset.label}:</strong> ${financialData.currency} ${asset.value.toLocaleString('en-IN')} (${asset.percentage.toFixed(2)}%)`;
            assetsList.appendChild(listItem);
        });
    };

    // Function to render the list of family members
    const renderFamilyMembersList = () => {
        familyMembersList.innerHTML = ''; // Clear previous list
        const familyData = calculateRelativePercentages(financialData.familyContributions, financialData.totalNetWorth);
        familyData.forEach(member => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${member.label}:</strong> ${financialData.currency} ${member.value.toLocaleString('en-IN')} (${member.percentage.toFixed(2)}%)`;
            familyMembersList.appendChild(listItem);
        });
    };


    // Function to create or update the bar chart
    const updateBarChart = () => {
        const assetData = calculateRelativePercentages(financialData.assets, financialData.totalNetWorth);
        const familyData = calculateRelativePercentages(financialData.familyContributions, financialData.totalNetWorth);

        const labels = [];
        const values = [];
        const colors = [];

        assetData.forEach(item => {
            labels.push(`${item.label} (${item.percentage.toFixed(2)}%)`);
            values.push(item.value);
            colors.push(item.color);
        });

        familyData.forEach(item => {
            labels.push(`${item.label} (Family: ${item.percentage.toFixed(2)}%)`);
            values.push(item.value);
            colors.push(item.color);
        });

        // Add a "Remaining Balance" or "Unallocated" bar if totalNetWorth is not fully covered
        let currentAllocatedValue = Object.values(financialData.assets).reduce((sum, asset) => sum + asset.value, 0) +
                                    Object.values(financialData.familyContributions).reduce((sum, member) => sum + member.value, 0);

        let remainingBalance = financialData.totalNetWorth - currentAllocatedValue;

        if (remainingBalance > 0 || financialData.totalNetWorth === 0) { // Show if there's remaining or if total is 0 to indicate unallocated
            labels.push(`Unallocated (${((remainingBalance / financialData.totalNetWorth) * 100).toFixed(2)}%)`);
            values.push(Math.max(0, remainingBalance)); // Ensure value is not negative
            colors.push('#CCCCCC'); // Grey for unallocated
        }


        // Destroy existing chart if it exists
        if (assetChart) {
            assetChart.destroy();
        }

        // Create a canvas element if it doesn't exist
        let canvas = document.getElementById('myBarChart');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'myBarChart';
            assetPieChartContainer.innerHTML = ''; // Clear previous content
            assetPieChartContainer.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        assetChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Amount (${financialData.currency})`,
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace(')', ', 0.8)')).map(color => color.replace('rgb', 'rgba')), // Slightly darker border
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: `Amount (${financialData.currency})`
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Category / Contributor'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false, // Hide legend as percentages are in labels
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                const value = context.raw;
                                return `${label}: ${financialData.currency} ${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                }
            }
        });
    };

    // --- Event Listeners ---

    // Update balance button (Now truly updates the totalNetWorth)
    updateBalanceBtn.addEventListener('click', () => {
        const amount = parseFloat(updateBalanceInput.value);
        if (!isNaN(amount) && amount >= 0) {
            financialData.totalNetWorth = amount; // Directly set the total net worth
            updateTotalNetWorth(); // Update display and save
            renderAssetsList(); // Recalculate percentages and update lists
            renderFamilyMembersList();
            updateBarChart(); // Update chart based on new total
            updateBalanceInput.value = '';
        } else {
            alert('Please enter a valid positive number for the balance.');
        }
    });

    // Currency converter (client-side only for display)
    currencyConverter.addEventListener('change', (event) => {
        financialData.currency = event.target.value;
        renderNetWorth();
        renderAssetsList();
        renderFamilyMembersList();
        updateBarChart();
    });


    // Toggle family contribution section visibility
    familyContributionBtn.addEventListener('click', () => {
        familyContributionSection.style.display = familyContributionSection.style.display === 'none' ? 'block' : 'none';
    });

    // Add new family member
    addFamilyMemberBtn.addEventListener('click', () => {
        const name = familyMemberNameInput.value.trim();
        const value = parseFloat(familyMemberValueInput.value);
        const color = familyMemberColorInput.value;

        if (name && !isNaN(value) && value >= 0) {
            financialData.familyContributions[name] = { value: value, color: color };
            updateTotalNetWorth(); // Update total (which is now static user input)
            renderFamilyMembersList(); // Update family list
            updateBarChart(); // Update chart
            familyMemberNameInput.value = '';
            familyMemberValueInput.value = '';
        } else {
            alert('Please enter a valid name and positive value for the family member contribution.');
        }
    });

    // Handle asset dropdown changes to show input fields
    assetDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', (event) => {
            const parentDiv = event.target.closest('div');
            const inputSection = parentDiv.querySelector('div[style*="display: none"]');
            if (inputSection) {
                if (event.target.value !== '') {
                    inputSection.style.display = 'block';
                } else {
                    inputSection.style.display = 'none';
                }
            }
        });

        // Add asset from dropdown
        const addAssetBtn = dropdown.closest('div').querySelector('.addAssetBtn');
        if (addAssetBtn) {
            addAssetBtn.addEventListener('click', (event) => {
                const parentDiv = event.target.closest('div');
                const selectedAssetType = dropdown.value;
                const assetValueInput = parentDiv.querySelector('.asset-value');
                const assetColorInput = parentDiv.querySelector('.asset-color');

                const value = parseFloat(assetValueInput.value);
                const color = assetColorInput.value;

                if (selectedAssetType && !isNaN(value) && value >= 0) {
                    financialData.assets[selectedAssetType] = { value: value, color: color };
                    updateTotalNetWorth(); // Update total (which is now static user input)
                    renderAssetsList(); // Update assets list
                    updateBarChart(); // Update chart
                    assetValueInput.value = '';
                    parentDiv.querySelector('div[style*="display: block"]').style.display = 'none'; // Hide input section
                    dropdown.value = ''; // Reset dropdown
                } else {
                    alert('Please select an asset type and enter a valid positive amount.');
                }
            });
        }
    });

    // Add custom asset
    addCustomAssetBtn.addEventListener('click', () => {
        const name = newAssetNameInput.value.trim();
        const value = parseFloat(newAssetValueInput.value);
        const color = newAssetColorInput.value;

        if (name && !isNaN(value) && value >= 0) {
            financialData.assets[name] = { value: value, color: color };
            updateTotalNetWorth();
            renderAssetsList(); // Update assets list
            updateBarChart(); // Update chart
            newAssetNameInput.value = '';
            newAssetValueInput.value = '';
        } else {
            alert('Please enter a valid name and positive value for the new asset.');
        }
    });

    // --- Initial Render on Load ---
    renderNetWorth();
    renderAssetsList();
    renderFamilyMembersList();
    updateBarChart();
});