const orderModel = require("../models/order");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const userModel = require("../models/user");
const excel4node = require('excel4node');










exports.salesReportGet = async (req, res) => {
    try {
        let orders = await orderModel.find({}).populate('userId');
        
        orders = orders.filter(order => order.products.some(product => product.orderStatus));
        const { dailyStats, monthlyStats, yearlyStats  } = await getOrderStats();
        return res.render('adm-sales-report.ejs', { orders, dailyStats, monthlyStats, yearlyStats } );
    } catch (err) {
        console.log(err);
    }
};



exports.customSalesReportGet = async ( req, res ) => {
    try{
        let reportType = req.params.reportType, fromDate, toDate;
        const currentDate = new Date();
        if(reportType === 'daily'){
            fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
            toDate = new Date();
        }else if( reportType === 'monthly'){
            fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
            toDate = new Date();
        }else if( reportType === 'yearly'){
            fromDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
            toDate = new Date();
        }else {
            fromDate = req.query.fromDate;
            toDate = req.query.toDate;
        }
        if( new Date(fromDate) >= new Date(toDate)) return res.json({ error: 'start date must be less than end date'});
        let orders = await orderModel.find({
            deliveredAt: {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            }
        }).populate('userId');
        orders = orders.filter(order => order.products.some(product => product.orderStatus));
        const { dailyStats, monthlyStats, yearlyStats } = await getOrderStats( );
        const noOfUsers = await usersCount(fromDate, toDate);
        const noOfOrders = await orderCount(fromDate, toDate);
        const revenueAmount = await getRevenueAmount(fromDate, toDate);
        const productsSale = await getTopProductsSale(fromDate, toDate);
        const topCategoryies = await getTopCategoryies(fromDate, toDate);
        const paymentOptions = await getNoOfPayments(fromDate, toDate);
        const orderStatus = await getProductStatus(fromDate, toDate);
        const data = { noOfOrders, noOfUsers, revenueAmount, productsSale, topCategoryies, paymentOptions, orderStatus };
        return res.status(200).json({ message: 'success', orders, dailyStats, monthlyStats, yearlyStats, data });
    }catch(err){
        console.log(err);
    }
}


async function getOrderStats() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  // Daily stats
  const dailyOrders = await orderModel.find({
    orderDate: { $gte: twentyFourHoursAgo }
  });
  const dailyOrderCount = dailyOrders.length;
  const dailyRevenueAmount = dailyOrders.reduce((total, order) => total + order.totalPrice, 0);

  // Monthly stats
  const monthlyOrders = await orderModel.find({
    orderDate: { $gte: thirtyDaysAgo }
  });
  const monthlyOrderCount = monthlyOrders.length;
  const monthlyRevenueAmount = monthlyOrders.reduce((total, order) => total + order.totalPrice, 0);

  // Yearly stats
  const yearlyOrders = await orderModel.find({
    orderDate: { $gte: oneYearAgo }
  });
  const yearlyOrderCount = yearlyOrders.length;
  const yearlyRevenueAmount = yearlyOrders.reduce((total, order) => total + order.totalPrice, 0);

  return {
    dailyStats: { dailyOrderCount, dailyRevenueAmount },
    monthlyStats: { monthlyOrderCount, monthlyRevenueAmount },
    yearlyStats: { yearlyOrderCount, yearlyRevenueAmount }
  };
}





exports.salesReportTotalGet = async ( req, res ) => {
    const noOfUsers = await usersCount();
    const noOfOrders = await orderCount();
    const revenueAmount = await getRevenueAmount();
    const productsSale = await getTopProductsSale();
    const topCategoryies = await getTopCategoryies();
    const paymentOptions = await getNoOfPayments();
    const orderStatus = await getProductStatus();
    const data = { noOfOrders, noOfUsers, revenueAmount, productsSale, topCategoryies, paymentOptions, orderStatus };
    return res.json({ data });
}


async function usersCount(fromDate, toDate) {
    let noOfUsers;
    if(fromDate && toDate){
        noOfUsers = await userModel.find({ created_at: { $gte: new Date(fromDate), $lte: new Date(toDate) }}).countDocuments();
    }else {
        noOfUsers = await userModel.find({}).countDocuments();
    }
    return noOfUsers;
}

async function orderCount(fromDate, toDate) {
    let noOfOrders;
    if(fromDate && toDate){
        noOfOrders = await orderModel.find({ deliveredAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }}).countDocuments();
    }else {
        noOfOrders = await orderModel.find({}).countDocuments();
    }
    return noOfOrders;
}


async function getRevenueAmount(fromDate, toDate) {
    let revenueAmount = 0;

    if (fromDate && toDate) {
        revenueAmount = await orderModel.aggregate([
            {
                $match: {
                    deliveredAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$totalPrice" }
                }
            }
        ]);
    } else {
        revenueAmount = await orderModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$totalPrice" }
                }
            }
        ]);
    }
    return revenueAmount.length > 0 ? revenueAmount[0].totalPrice : 0;
}


async function getTopProductsSale(fromDate, toDate) {
    try {
        let pipeline = [];

        if (fromDate && toDate) {
            pipeline = [
                {
                    $match: {
                        deliveredAt: {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate)
                        }
                    }
                }
            ];
        }

        pipeline.push(
            {
                $unwind: '$products'
            },
            {
                $group: {
                    _id: '$products.productId', // Corrected field reference
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    productName: { $arrayElemAt: ['$productInfo.name', 0] }
                }
            }
        );

        const productsSale = await orderModel.aggregate(pipeline);
        return productsSale;
    } catch (error) {
        console.error('Error getting top products sale:', error);
        throw error;
    }
}


async function getTopCategoryies(fromDate, toDate) {
    try {
        let pipeline = [];

        if (fromDate && toDate) {
            pipeline = [
                {
                    $match: {
                        deliveredAt: {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate)
                        }
                    }
                }
            ];
        }

        pipeline.push(
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            {
                $unwind: '$productInfo'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productInfo.category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $group: {
                    _id: '$categoryInfo.categoryName',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    categoryName: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        );

        const categoriesSale = await orderModel.aggregate(pipeline);
        return categoriesSale;
    } catch (error) {
        console.error('Error getting top categories sale:', error);
        throw error;
    }
}


async function getNoOfPayments(fromDate, toDate) {
    try {
        const pipeline = [];

        // Match orders within the specified date range
        if (fromDate && toDate) {
            pipeline.push({
                $match: {
                    deliveredAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                }
            });
        }

        // Group by payment method
        pipeline.push({
            $group: {
                _id: "$paymentMethod",
                count: { $sum: 1 }
            }
        });

        const noOfPayment = await orderModel.aggregate(pipeline);
        return noOfPayment;
    } catch (err) {
        console.log(`Error on getNoOfPayments ${err}`);
        throw err; // Rethrow the error to be handled by the caller
    }
}


async function getProductStatus(fromDate, toDate) {
    try {
        const pipeline = [];

        // Match orders within the specified date range
        if (fromDate && toDate) {
            pipeline.push({
                $match: {
                    "products.deliveredAt": {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                }
            });
        }
        
        // Unwind the products array to work with each product separately
        pipeline.push({ $unwind: "$products" });

        // Project fields and define status based on product fields
        pipeline.push({
            $project: {
                _id: "$products._id",
                productId: "$products.productId",
                orderStatus: "$products.orderStatus",
                returned: "$products.returned",
                orderValid: "$products.orderValid",
                status: {
                    $cond: {
                        if: { $eq: ["$products.orderStatus", true] },
                        then: "Delivered",
                        else: {
                            $cond: {
                                if: { $eq: ["$products.orderValid", true] },
                                then: "Arriving",
                                else: {
                                    $cond: {
                                        if: { $eq: ["$products.returned", true] },
                                        then: "Returned",
                                        else: "Cancelled"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Group by status and count the number of products in each status group
        pipeline.push({
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        });

        const productStatus = await orderModel.aggregate(pipeline);
        return productStatus;
    } catch (err) {
        console.log(`Error on getProductStatus: ${err}`);
        throw err;
    }
}





exports.genPdfGet = async (req, res) => {

    const reportType = req.params.reportType;
    let fromDate = req.query.fromDate;
    let toDate = req.query.toDate;


    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="sales-report.pdf"'
    });
    const doc = new PDFDocument({ font: 'Helvetica', margin: 50});
    doc.pipe(res);

    const currentDate = new Date();
    if(reportType === 'daily'){
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
        toDate = new Date();
    }else if( reportType === 'monthly'){
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        toDate = new Date();
    }else if( reportType === 'yearly'){
        fromDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        toDate = new Date();
    }else {
        fromDate = req.query.fromDate;
        toDate = req.query.toDate;
    }

    const no_of_orders = await orderCount(fromDate, toDate);
    const total_revenue = await getRevenueAmount(fromDate, toDate);
    const no_of_users = await usersCount(fromDate, toDate);

    const top_products = await getTopProductsSale(fromDate, toDate);
    const top_categories = await getTopCategoryies(fromDate, toDate);
    const top_payments = await getNoOfPayments(fromDate, toDate);
    const order_status = await getProductStatus(fromDate, toDate);

    const parameters = [ no_of_orders, total_revenue, no_of_users, top_products, top_categories, top_payments, order_status ];
    genSalesReportPDF(doc, ...parameters);

    doc.end();
}



async function genSalesReportPDF(doc, ...parameters) {

    const [no_of_orders, total_revenue, no_of_users, top_products, top_categories, top_payments, order_status] = parameters;

    doc.fontSize(18).font('Helvetica-Bold').text('SALES REPORT', { align: 'center' })
        .moveDown();

    doc.font('Helvetica').fontSize(10).text(`Date : ${new Date(Date.now()).toLocaleDateString()}`, { align: 'right'});

    doc.font('Helvetica-Bold').fontSize(14).text('MARGIN');
    doc.moveDown(0.3)
        .font('Helvetica')
        .fontSize(8).text(`Abcd street`)
        .fontSize(8).text(`Calicut, Kerala, 673020`)
        .fontSize(8).text(`1800-208-9898`)
        
    generateHr(doc, doc.y + 10);
    
    // orders , revenue and number of users
    doc.moveDown(2);
    doc.font('Helvetica-Bold').moveDown(0.5)
        .text(`Orders : ${no_of_orders}`).moveDown(0.5)
        .text(`Revenue : ${total_revenue}$`).moveDown(0.5)
        .text(`Users signup  : ${no_of_users}`);
    generateHr(doc, doc.y + 10);
        
    // top selling products looping
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(14).text('Top Selling Products');
    doc.font('Helvetica').fontSize(10).moveDown();
    for( let i = 0; i < top_products.length; i++ ){ doc.text(`${i+1} . ${top_products[i].productName} : ${ top_products[i].count }`).moveDown(0.3) }
    generateHr(doc, doc.y + 10);

    // top categories products looping
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(14).text(`Top Selling Categories`);
    doc.font('Helvetica').fontSize(10).moveDown();
    for( let i = 0; i < top_categories.length; i++ ){ doc.text(`${i+1} . ${top_categories[i].categoryName} : ${ top_categories[i].count }`).moveDown(0.3) }
    generateHr(doc, doc.y + 10);


    // most using payments systems products looping
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(14).text('Most Using Payment Options');
    doc.font('Helvetica').fontSize(10).moveDown();
    for( let i = 0; i < top_payments.length; i++ ){ doc.text(`${i+1} . ${top_payments[i]._id} : ${ top_payments[i].count }`).moveDown(0.3) }
    generateHr(doc, doc.y + 10);


    // Order status looping
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(14).text('Order Status');
    doc.font('Helvetica').fontSize(10).moveDown();
    for( let i = 0; i < order_status.length; i++ ){ doc.text(`${i+1} . ${order_status[i]._id} : ${ order_status[i].count }`).moveDown(0.3) }
    generateHr(doc, doc.y + 10);

    return;
}


function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }




  exports.salesReportExcelGet = async ( req, res ) => {
    try{

        const reportType = req.params.reportType;
        let fromDate = req.query.fromDate;
        let toDate = req.query.toDate;

    const currentDate = new Date();
    if(reportType === 'daily'){
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
        toDate = new Date();
    }else if( reportType === 'monthly'){
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        toDate = new Date();
    }else if( reportType === 'yearly'){
        fromDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        toDate = new Date();
    }else {
        fromDate = req.query.fromDate;
        toDate = req.query.toDate;
    }

    const no_of_orders = await orderCount(fromDate, toDate);
    const total_revenue = await getRevenueAmount(fromDate, toDate);
    const no_of_users = await usersCount(fromDate, toDate);

    const top_products = await getTopProductsSale(fromDate, toDate);
    const top_categories = await getTopCategoryies(fromDate, toDate);
    const top_payments = await getNoOfPayments(fromDate, toDate);
    const order_status = await getProductStatus(fromDate, toDate);

    const parameters = [ no_of_orders, total_revenue, no_of_users, top_products, top_categories, top_payments, order_status ];

    const workbook = new excel4node.Workbook();
    const headerStyle = workbook.createStyle({
        font: { bold: true }
    });
    const worksheet1 = workbook.addWorksheet('Sheet 1');
    await genExcelReport(worksheet1, headerStyle, ...parameters);

     // Write the workbook to a buffer
     const buffer = await workbook.writeToBuffer();
     
     // Send the buffer as a response
     res.writeHead(200, {
       'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
       'Content-Disposition': 'attachment; filename="sales-report.xlsx"',
       'Content-Length': buffer.length
     });
     res.end(buffer);
    }catch(err){
        console.log(err);
    }
  }



  async function genExcelReport(worksheet, headerStyle, no_of_orders, total_revenue, no_of_users, top_products, top_categories, top_payments, order_status) {

    // Add data to the worksheet
    let row = 2, col;
    worksheet.cell(row, 1).string('Sales Report').style(headerStyle);
    // worksheet.removeColumns(3, 1000); // Remove columns from 3 to the end


    worksheet.cell(row += 2, 1).string('No. of Orders');
    worksheet.cell(row, 2).number(no_of_orders);
    worksheet.cell(++row, 1).string('Total Revenue');
    worksheet.cell(row, 2).number(total_revenue);
    worksheet.cell(++row, 1).string('No. of Users');
    worksheet.cell(row, 2).number(no_of_users);

    row += 2;
     // Add top products
     worksheet.cell(row, 1).string('Top Products').style(headerStyle);
     row++;
     top_products.forEach((product, index) => {
         worksheet.cell(row + index, 1).string(`${index + 1}. ${product.productName}`);
         worksheet.cell(row + index, 2).number(product.count);
     });

     // Add top categories
     row += top_products.length + 1;
     worksheet.cell(row, 1).string('Top Categories').style(headerStyle);
     row++;
     top_categories.forEach((category, index) => {
         worksheet.cell(row + index, 1).string(`${index + 1}. ${category.categoryName}`);
         worksheet.cell(row + index, 2).number(category.count);
     });
 
     // Add top payments
     row += top_categories.length + 1;
     worksheet.cell(row, 1).string('Top Payments').style(headerStyle);
     row++;
     top_payments.forEach((payment, index) => {
         worksheet.cell(row + index, 1).string(`${index + 1}. ${payment._id}`);
         worksheet.cell(row + index, 2).number(payment.count);
     });
     
     // Add order status
     row += top_payments.length + 1;
     worksheet.cell(row, 1).string('Order Status').style(headerStyle);
     row++;
     order_status.forEach((status, index) => {
         worksheet.cell(row + index, 1).string(`${status.name}`);
         worksheet.cell(row + index, 2).number(status.count);
     });
  
    return worksheet;
}