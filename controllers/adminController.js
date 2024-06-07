const adminModel = require('../models/admin');
const userModel = require('../models/user');
const orderModel = require('../models/order');
const productModel = require('../models/products');
const categoryModel = require('../models/category');





exports.adminLoginGet = ( req, res ) => {
    res.render('admin-login.ejs');
}

exports.dashBoardDetails = async ( req, res ) => {
    const topProducts = await getTopProductsSale();
    const topCategoryies = await getTopCategoryies();
    const totalUsers = await usersCount();
    const totalOrders = await orderCount();
    const totalRevenue = await getRevenueAmount();
   const totalProducts = await productModel.find({}).countDocuments();
    return res.status(200).json({ topProducts, topCategoryies, totalUsers, totalOrders, totalRevenue, totalProducts });
}

exports.customDetails = async ( req, res ) => {
    let { fromDate, toDate, filterType } = req.query;
    try{
        if(filterType === 'custom') {
            if(new Date(fromDate) >= new Date(toDate)) return res.status(200).json({ error: 'from Date should be before the to Date'});
            if(!fromDate || !toDate) return res.status(404).json({ error: 'Change the filter or choose the Date'});
        }else if(filterType === 'daily'){
            toDate = new Date();
            fromDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() - 1);
        }else if(filterType === 'weekly'){
            toDate = new Date();
            fromDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() - 7);
        }else if(filterType ==='monthly'){
            toDate = new Date();
            fromDate = new Date(toDate.getFullYear(), toDate.getMonth() - 1, toDate.getDate());
        }else if( filterType === 'yearly') {
            toDate = new Date();
            fromDate = new Date(toDate.getFullYear() -1 , toDate.getMonth(), toDate.getDate());
        }else {
            return res.status(400).json({ message: 'wrong filter type'});
        }
        const topProducts = await getTopProductsSale(fromDate, toDate);
        const topCategoryies = await getTopCategoryies(fromDate, toDate);
        const totalUsers = await usersCount(fromDate, toDate);
        const totalOrders = await orderCount(fromDate, toDate);
        const totalRevenue = await getRevenueAmount(fromDate, toDate);
        const topBrands = await topSaledBrands(fromDate, toDate);
        const totalProducts = await productModel.find({}).countDocuments();
        return res.status(200).json({ topProducts, topCategoryies, totalUsers, totalOrders, totalRevenue, totalProducts, topBrands });
    }catch(err){
        console.log(`Error inside customDetails : \n${err}`);
    }
}



exports.adminLoginPost = async ( req, res ) => {
    const { email, password } = req.body;
    console.log( 'email : ' + email, 'password : ' + password );

    const admin = await adminModel.findOne({ email });
    console.log('admin : ' + admin );

    // console.log('admin.password: ' + admin.password, 'admin.email : ' + admin.email );

    if(!email || !password){
        return res.status(400).json({ error: 'email and password is required '});
    }

    if(!admin || admin === null ){
        return res.status(400).json({ error: 'email is incorrect'});
    }

    if(admin.password !== password){
        return res.status(400).json({ error: 'password is incorrect'});
    }

    if(admin.password === password){
        req.session.admin = true;
        console.log('req.session.isAdmin : ' + req.session.admin );
        return res.status(200).json({ success: 'perfect admin'});
    }

    return res.status(400).json({ error: 'somethign make me wrong'});
}



exports.adminHomeGet = ( req, res ) => {
    res.render('admin-home.ejs');
}






exports.logout = ( req, res ) => {
    delete req.session.admin;
    res.redirect('login');
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


async function usersCount(fromDate, toDate) {
    let noOfUsers;
    if(fromDate && toDate){
        noOfUsers = await userModel.find({ created_at: { $gte: new Date(fromDate), $lte: new Date(toDate) }}).countDocuments();
    }else {
        noOfUsers = await userModel.find({}).countDocuments();
    }
    return noOfUsers;
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

async function topSaledBrands(fromDate, toDate) {
    try {
      const pipeline = [];
  
      // Filter by date range (if provided)
      if (fromDate && toDate) {
        pipeline.push({
          $match: {
            deliveredAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          },
        });
      }
  
      // Group by brand and count documents
      pipeline.push({
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
        },
      });
  
      // Sort by count in descending order
      pipeline.push({
        $sort: {
          count: -1,
        },
      });
  
      const brands = await productModel.aggregate(pipeline);
      return brands
    } catch (err) {
      console.log(`Error at topSaledBrands: ${err}`);
    }
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