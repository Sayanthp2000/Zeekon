let fromDate = document.querySelector('#from-date');
let toDate = document.querySelector('#to-date');

function findReportType() {
    const reportType = document.querySelector('#report-type');
    return reportType.value;
}

function validateDates() {
    const fromDateValue = new Date(fromDate.value);
    const toDateValue = new Date(toDate.value);
    const today = new Date();

    if (fromDateValue > toDateValue) {
        failureMessage('From date cannot be after To date.');
        return false;
    }

    if (fromDateValue > today || toDateValue > today) {
        failureMessage('Dates cannot be in the future.');
        return false;
    }

    return true;
}

const filterButton = document.querySelector('.btn-apply');
filterButton.addEventListener('click', async (event) => {
    if ((fromDate.value && !toDate.value) || (!fromDate.value && toDate.value)) {
        return failureMessage('Both From and To dates must be selected.');
    }

    const reportType = findReportType();
    if ((!fromDate.value || !toDate.value) && reportType === 'custom') {
        return failureMessage('No Date selected, or change filter Type.');
    }

    if (!validateDates()) {
        return;
    }

    // Construct the URL with query parameters
    const url = `/admin/sales-report/${reportType}?fromDate=${fromDate.value}&toDate=${toDate.value}`;

    const response = await fetch(url);
    const body = await response.json();
    if (body.error) {
        failureMessage(body.error);
    } else {
        document.querySelector('.noOfOrders').innerHTML = body.data.noOfOrders;
        document.querySelector('.revenueAmount').innerHTML = body.data.revenueAmount;
        document.querySelector('.noOfUsers').innerHTML = body.data.noOfUsers;
        const productsDiv = document.querySelector('.top-products-sale');
        topProductsSale(body.data.productsSale, productsDiv);
        const categoryDiv = document.querySelector('.top-categories-sale');
        topCategoriesSale(body.data.topCategoryies, categoryDiv);
        const paymentMethodsDiv = document.querySelector('.payment-options');
        topPaymentOptions(body.data.paymentOptions, paymentMethodsDiv);
        const orderStatusDiv = document.querySelector('.order-status');
        displayOrderStatusSummary(body.data.orderStatus, orderStatusDiv);
    }
});

const generateReportButton = document.querySelector('#generate-pdf');
generateReportButton.addEventListener('click', async (event) => {
    const reportType = findReportType();
    if (reportType === 'custom' && (!fromDate.value || !toDate.value)) {
        return failureMessage('Select date if custom or change filter type.');
    }

    if (!validateDates()) {
        return;
    }

    const response = await fetch(`/admin/sales/pdf/${reportType}?fromDate=${fromDate.value}&toDate=${toDate.value}`);

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        console.error('Failed to generate PDF:', response.status, response.statusText);
    }
});

const generateExcelButton = document.querySelector('#generate-excel');
generateExcelButton.addEventListener('click', async (event) => {
    const reportType = findReportType();
    if (reportType === 'custom' && (!fromDate.value || !toDate.value)) {
        return failureMessage('Select date if custom or change filter type.');
    }

    if (!validateDates()) {
        return;
    }

    const response = await fetch(`/admin/sales/excel/${reportType}?fromDate=${fromDate.value}&toDate=${toDate.value}`);

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${reportType}-${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        console.error('Failed to generate Excel:', response.status, response.statusText);
    }
});

document.addEventListener('DOMContentLoaded', async (event) => {
    const response = await fetch('/admin/sales-report-total');
    const body = await response.json();
    document.querySelector('.noOfOrders').innerHTML = body.data.noOfOrders;
    document.querySelector('.revenueAmount').innerHTML = body.data.revenueAmount;
    document.querySelector('.noOfUsers').innerHTML = body.data.noOfUsers;
    const productsDiv = document.querySelector('.top-products-sale');
    topProductsSale(body.data.productsSale, productsDiv);
    const categoryDiv = document.querySelector('.top-categories-sale');
    topCategoriesSale(body.data.topCategoryies, categoryDiv);
    const paymentMethodsDiv = document.querySelector('.payment-options');
    topPaymentOptions(body.data.paymentOptions, paymentMethodsDiv);
    const orderStatusDiv = document.querySelector('.order-status');
    displayOrderStatusSummary(body.data.orderStatus, orderStatusDiv);
});

function topProductsSale(products, productsDiv) {
    productsDiv.innerHTML = `<h3> Top Product Sale <h3>`;
    const productsContainerDiv = document.createElement('div');
    productsContainerDiv.classList.add('products-container');
    for (let i = 0; i < products.length; i++) {
        let productDiv = document.createElement('div');
        productDiv.classList.add('product-item');
        let pName = document.createElement('p');
        pName.innerHTML = products[i].productName;
        let pCount = document.createElement('p');
        pCount.innerHTML = products[i].count;
        productDiv.appendChild(pName);
        productDiv.appendChild(pCount);
        productsContainerDiv.appendChild(productDiv);
    }
    productsDiv.appendChild(productsContainerDiv);
}

function topCategoriesSale(categories, categoryDiv) {
    categoryDiv.innerHTML = `<h3> Top Category Sale <h3>`;
    const categoryContainerDiv = document.createElement('div');
    categoryContainerDiv.classList.add('category-container');
    for (let i = 0; i < categories.length; i++) {
        let categoryItemDiv = document.createElement('div');
        categoryItemDiv.classList.add('category-item');
        let categoryName = document.createElement('p');
        categoryName.classList.add('category-name');
        categoryName.innerHTML = categories[i].categoryName;
        let categoryCount = document.createElement('p');
        categoryCount.innerHTML = categories[i].count;
        categoryCount.classList.add('category-count');
        categoryItemDiv.appendChild(categoryName);
        categoryItemDiv.appendChild(categoryCount);
        categoryContainerDiv.appendChild(categoryItemDiv);
    }
    if (categoryDiv) {
        categoryDiv.appendChild(categoryContainerDiv);
    }
}

function topPaymentOptions(paymentMethods, paymentMethodsDiv) {
    paymentMethodsDiv.innerHTML = `<h3> Top Payment Options <h3>`;
    const paymentContainerDiv = document.createElement('div');
    paymentContainerDiv.classList.add('payment-container');
    for (let i = 0; i < paymentMethods.length; i++) {
        let paymentItemDiv = document.createElement('div');
        paymentItemDiv.classList.add('payment-item');
        let paymentMethodName = document.createElement('p');
        paymentMethodName.innerHTML = paymentMethods[i]._id;
        let paymentMethodCount = document.createElement('p');
        paymentMethodCount.innerHTML = paymentMethods[i].count;
        paymentItemDiv.appendChild(paymentMethodName);
        paymentItemDiv.appendChild(paymentMethodCount);
        paymentContainerDiv.appendChild(paymentItemDiv);
    }
    paymentMethodsDiv.appendChild(paymentContainerDiv);
}

function displayOrderStatusSummary(orderStatusSummary, orderStatusDiv) {
    orderStatusDiv.innerHTML = `<h3> Order Statuses <h3>`;
    const orderStatusContainerDiv = document.createElement('div');
    orderStatusContainerDiv.classList.add('order-status-container');
    for (let i = 0; i < orderStatusSummary.length; i++) {
        let statusItemDiv = document.createElement('div');
        statusItemDiv.classList.add('status-item');
        let statusName = document.createElement('p');
        statusName.innerHTML = orderStatusSummary[i]._id;
        let statusCount = document.createElement('p');
        statusCount.innerHTML = orderStatusSummary[i].count;
        statusItemDiv.appendChild(statusName);
        statusItemDiv.appendChild(statusCount);
        orderStatusContainerDiv.appendChild(statusItemDiv);
    }
    orderStatusDiv.appendChild(orderStatusContainerDiv);
}

function successMessage(message) {
    Swal.fire({
        text: message,
        position: 'top',
        timer: 2000,
        background: 'green',
        color: 'white',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        showCloseButton: true
    });
}

function failureMessage(message) {
    Swal.fire({
        text: message,
        position: 'top',
        timer: 3000,
        background: 'red',
        color: 'white',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        showCloseButton: true
    });
}
