var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');

/* GET home page. */

// Admin credentials
let credentials={
  adminName: "Admin",
  adminEmail: "admin@gmail.com",
  adminPassword: "123"
}
// Admin credentials Till here

router.get('/login',(req,res)=>{
  if(req.session.adminLoggedIn){
    res.redirect('/admin');
  }else{
    res.render('admin/admin-login',{admin:true,adminLoginErr:req.session.adminLoginErr});
    req.session.adminLoginErr=false;
  }
})

router.post('/login',(req,res)=>{
  // console.log(req.body.email);
  if(req.body.email==credentials.adminEmail&&req.body.password==credentials.adminPassword){
    req.session.admin=req.body.email;
    req.session.adminLoggedIn=true;
    req.session.adminName=credentials.adminName;
    // console.log(req.session.adminName);
    res.redirect('/admin');
  }else{
    req.session.adminLoginErr="Invalid username or password";
    res.redirect('/admin/login');
  }
})

router.get('/', (req, res)=>{
  if(req.session.adminLoggedIn){
    // console.log(req.session.adminName);
    productHelpers.getAllProducts().then((products)=>{
      res.render('admin/admin-view',{admin:true,products,adminName:req.session.adminName});
    })
  }else{
    res.redirect('/admin/login');
  }
});

router.get('/add-product',(req,res)=>{
  res.render('admin/add-product', {admin:true});
})

router.post('/add-product',(req,res)=>{
  productHelpers.addProduct(req.body,(id)=>{
    let img = req.files.image;
    img.mv('./public/product-images/'+id+'.jpg',(err)=>{
      if(!err) {
        res.render('admin/add-product',{admin:true});
      }else{
        console.log(err);
      }
    })
  })
})

router.get('/delete/:id',(req,res)=>{
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin');
  })
})

router.get('/editProduct/:id',async(req,res)=>{
  // let proId = req.params.id;
  let product = await productHelpers.getProductDetails(req.params.id);
  // console.log(product);
  res.render('admin/edit-product',{product});
})

router.post('/editProduct/:id',(req,res)=>{
  let image = req.files.image;
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    // console.log("updated !!!");
    res.redirect('/admin');
    if(req.files.image){
      image.mv('./public/product-images/'+req.params.id+'.jpg');
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/admin/login');
})

module.exports = router;
