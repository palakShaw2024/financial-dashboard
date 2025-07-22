const totalMoneyElement = document.getElementById('totalMoney');
const lastUpdatedElement = document.getElementById('lastUpdated');
const assetAllocationList = document.getElementById('assetAllocationList');
const newsFeedElement = document.getElementById('newsFeed');
const balanceInput = document.getElementById('balanceInput');
const updateBalanceBtn = document.getElementById('updateBalanceBtn');
const spendingListElement = document.getElementById('spendingList');
const newAssetNameInput = document.getElementById('newAssetName');
 const newAssetValueInput = document.getElementById('newAssetValue');
const newAssetColorInput = document.getElementById('newAssetColor');
const addAssetBtn = document.getElementById('addAssetBtn');
const newSpendingCategoryInput = document.getElementById('newSpendingCategory');
const newSpendingAmountInput = document.getElementById('newSpendingAmount');
const addSpendingBtn = document.getElementById('addSpendingBtn');



const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        };

        
        let financialData = {
            totalMoney: 0, 
            assetClasses: [
                { name: 'Stocks', value: 0, color: '#4CAF50' },
                { name: 'Bonds', value: 0, color: '#2196F3' },
                { name: 'Real Estate', value: 0, color: '#FFC107' },
                { name: 'Cash', value: 0, color: '#9E9E9E' }
            ],
            previousSpending: [
                { category: 'Groceries', amount: 450.20 },
                { category: 'Utilities', amount: 180.50 },
                { category: 'Dining Out', amount: 320.00 },
                { category: 'Transportation', amount: 120.75 },
                { category: 'Entertainment', amount: 250.00 }
            ],
            lastUpdated: new Date().toLocaleDateString('en-IN', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        

        const calculateTotalMoney = () => {
            return financialData.assetClasses.reduce((sum, asset) => sum + asset.value, 0);
        };

        
        const renderDashboard = () => {
            financialData.totalMoney = calculateTotalMoney();
            totalMoneyElement.textContent = formatCurrency(financialData.totalMoney);
            lastUpdatedElement.textContent = financialData.lastUpdated;

            
            assetAllocationList.innerHTML = ''; 
            financialData.assetClasses.forEach((asset, index) => {
                
                const percentage = financialData.totalMoney > 0 ? ((asset.value / financialData.totalMoney) * 100).toFixed(1) : 0;

                const assetItem = document.createElement('div');
                assetItem.className = 'asset-item';
                assetItem.innerHTML = `
                    <div class="asset-row-top">
                        <div class="asset-info">
                            <span class="color-dot" style="background-color: ${asset.color};"></span>
                            <span class="asset-name">${asset.name}</span>
                        </div>
                        <div class="asset-value-input-container">
                            <input type="number" class="asset-value-input" data-index="${index}" value="${asset.value.toFixed(2)}" step="0.01">
                            <span class="asset-percent">(${percentage}%)</span>
                            <button class="delete-btn" data-type="asset" data-index="${index}">&#x2715;</button> 
                        </div>
                    </div>
                `;
                assetAllocationList.appendChild(assetItem);
            });


            document.querySelectorAll('.asset-value-input').forEach(input => {
                input.addEventListener('change', (event) => {
                    const index = parseInt(event.target.dataset.index);
                    const newValue = parseFloat(event.target.value);

                    if (!isNaN(newValue) && newValue >= 0) {
                        financialData.assetClasses[index].value = newValue;
                        financialData.lastUpdated = new Date().toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        renderDashboard(); 
                    } else {
                        alert('Please enter a valid positive number for the asset value.');
                        
                        event.target.value = financialData.assetClasses[index].value.toFixed(2);
                    }
                });
            });


           
            spendingListElement.innerHTML = ''; 
            financialData.previousSpending.forEach((item, index) => {
                const spendingItem = document.createElement('div');
                spendingItem.className = 'spending-item';
                spendingItem.innerHTML = `
                    <div class="spending-item-content">
                        <span class="spending-category">${item.category}</span>
                        <span class="spending-value">${formatCurrency(item.amount)}</span>
                    </div>
                    <button class="delete-btn" data-type="spending" data-index="${index}">&#x2715;</button> 
                `;
                spendingListElement.appendChild(spendingItem);
            });

            
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const type = event.target.dataset.type;
                    const index = parseInt(event.target.dataset.index);

                    if (type === 'asset') {
                        deleteAsset(index);
                    } else if (type === 'spending') {
                        deleteSpending(index);
                    }
                });
            });
        };

        
        const deleteAsset = (index) => {
            if (confirm('Are you sure you want to delete this asset?')) { 
                financialData.assetClasses.splice(index, 1);
                financialData.lastUpdated = new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                renderDashboard();
            }
        };

       
        const deleteSpending = (index) => {
            if (confirm('Are you sure you want to delete this spending entry?')) { 
                financialData.previousSpending.splice(index, 1);
                renderDashboard();
            }
        };

        
        updateBalanceBtn.addEventListener('click', () => {
            const adjustmentAmount = parseFloat(balanceInput.value);
            if (!isNaN(adjustmentAmount)) {
                let cashAsset = financialData.assetClasses.find(asset => asset.name === 'Cash');

                
                if (!cashAsset) {
                    cashAsset = { name: 'Cash', value: 0, color: '#9E9E9E' };
                    financialData.assetClasses.push(cashAsset);
                }

                cashAsset.value += adjustmentAmount;
                
                if (cashAsset.value < 0) cashAsset.value = 0;

                financialData.lastUpdated = new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                renderDashboard(); 
                balanceInput.value = ''; 
            } else {
                alert('Please enter a valid number for cash adjustment.');
            }
        });

       
        addAssetBtn.addEventListener('click', () => {
            const name = newAssetNameInput.value.trim();
            const value = parseFloat(newAssetValueInput.value);
            const color = newAssetColorInput.value;

            if (name && !isNaN(value) && value >= 0) {
               
                const existingAsset = financialData.assetClasses.find(asset => asset.name.toLowerCase() === name.toLowerCase());
                if (existingAsset) {
                    existingAsset.value = value;
                    existingAsset.color = color; 
                } else {
                    financialData.assetClasses.push({ name, value, color });
                }

                financialData.lastUpdated = new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                renderDashboard(); 
                newAssetNameInput.value = '';
                newAssetValueInput.value = '';
                newAssetColorInput.value = '#4CAF50'; 
            } else {
                alert('Please enter a valid asset name and a positive number for its value.');
            }
        });

        
        addSpendingBtn.addEventListener('click', () => {
            const category = newSpendingCategoryInput.value.trim();
            const amount = parseFloat(newSpendingAmountInput.value);

            if (category && !isNaN(amount) && amount >= 0) {
                financialData.previousSpending.push({ category, amount });
                renderDashboard(); 
                newSpendingCategoryInput.value = '';
                newSpendingAmountInput.value = '';
            } else {
                alert('Please enter a valid spending category and a positive number for the amount.');
            }
        });

        renderDashboard();

        