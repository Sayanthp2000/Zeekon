
const categoryModel = require('../models/category');
const productModel = require('../models/products');





exports.categoryGet =  async ( req, res ) => {
    const categorys = await categoryModel.find({}).sort({ createdAt: -1 });
    const products = await productModel.find({}, { name: 1, _id: -1, category: 1 });
    console.log( products );
    res.render('admin-category.ejs', { categorys, products });
}




exports.createCategoryPost = async (req, res) => {
    try {
        console.log('inside add category');
        let { category } = req.body;
        console.log('category  : ' + category);

        if (!category || category.trim() === '') {
            console.log(`category can't be null`);
            return res.status(400).json({ error: 'Category name is required' });
        }

        

        const checkCategory = await categoryModel.findOne({ categoryName: new RegExp(`^${category}$`, 'i') });

        console.log(checkCategory);

        if (checkCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const result = await categoryModel.create({ categoryName: category });
        console.log('result : ' + result);
        return res.status(201).json({ message: 'Category created successfully' });
    } catch (err) {
        console.log('error : ' + err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}






exports.categoryListEditPatch =  async ( req, res ) => {
    console.log('inside add category');
    const { categoryId, action } = req.body;
    console.log('category  : ' + categoryId, 'action : ' + action );
    console.log('after req.body');
    try{
        if(!action){
            const result = await categoryModel.findOneAndUpdate({ _id: categoryId }, { isActive: false }, { new: true });
            console.log('result : ' + result );
        }else {
            const result = await categoryModel.findOneAndUpdate({ _id: categoryId }, { isActive: true }, { new: true });
            console.log('result : ' + result );
        }
        res.json({ message: 'created' });
    }
    catch(err){
        console.log('error : ' + err );
    }
}




exports.categoryDelete = async ( req, res ) => {
    try{
        console.log('Inside delete category');
        const categoryId = req.params.id;
        const result = await categoryModel.findOneAndDelete({ _id: categoryId });
        console.log('successfully deleted');
        return res.status(200).json({ message: 'deleted'});
    }
    catch(err){
        console.log('error : ' + err );
    }
}




exports.categoryUpdateGet = async ( req, res ) => {
    try{
        const categoryId = req.params.categoryId;
        const category = await categoryModel.findById(categoryId);
        if(!category){
            return res.status(400).json({ error: 'no category found'});
        }
        return res.json({ categoryName: category.categoryName });
    }
    catch(err){
        console.log(`error : ${err}`);
    }
}



exports.categoryUpdatePut = async (req, res) => {
    try {
        console.log('inside the categoryUpdatePut');
        const { categoryName } = req.body;
        const categoryId = req.params.categoryId;

        if (!categoryName || categoryName.trim() === '') {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const dbCategory = await categoryModel.findById(categoryId, { categoryName: 1 });
        if (!dbCategory) {
            return res.status(400).json({ error: 'Category not found' });
        }

        if (dbCategory.categoryName === categoryName.trim()) {
            return res.status(400).json({ error: 'Category name is the same' });
        }

        const check = await categoryModel.findOne({ categoryName: new RegExp(`^${categoryName.trim()}$`, 'i') });
        if (check) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const result = await categoryModel.findByIdAndUpdate(categoryId, { categoryName: categoryName.trim() }, { new: true });
        console.log(result);
        return res.status(200).json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.log('error : ' + error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


exports.addCategoryOffer = async (req, res)=>{
    try {
        const percentage = parseInt(req.body.percentage)
        const categoryId = req.body.categoryId  
        // console.log(percentage, categoryId);
        const findCategory = await categoryModel.findOne({_id : categoryId})
        // console.log(findCategory);
        await Category.updateOne(
            {_id : categoryId},
            {$set : {
                categoryOffer : percentage
            }}
        )
        .then(data=>{
            console.log(data)
            console.log("categoryOffer added");
        })

        const productData = await productModel.find({category : findCategory.name})
        // console.log(productData);

        for(const product of productData){
            product.salePrice = product.price - Math.floor(product.price * (percentage / 100) )
            await product.save()
        }

        res.json({status : true})

    } catch (error) {
        console.log(error.message);
    }
}


exports.removerCategoryOffer = async (req, res)=>{
    try {
        // console.log(req.body);
        const categoryId = req.body.categoryId
        const findCategory = await categoryModel.findOne({_id : categoryId})
        console.log(findCategory);

        const percentage = findCategory.categoryOffer
        // console.log(percentage);

        const productData = await productModel.find({category : findCategory.name})

        if(productData.length > 0){
            for(const product of productData){
                product.salePrice = product.price +  Math.floor(product.price * (percentage / 100))
                await product.save()
            }
        }

        findCategory.categoryOffer = 0
        await findCategory.save()

        res.json({status : true})

    } catch (error) {
        console.log(error.message);
    }
}