export class ProductService {
    GetAllStores = () => {
        return new Promise((resolve, reject)=>{
            fetch('/products')
            .then((res)=>res.json())
            .then((products)=>{
               resolve(products)
            })
            .catch((err)=>reject(err));
        })
    }
}