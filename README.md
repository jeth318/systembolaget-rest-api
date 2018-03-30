AUTHORIZATION
@POST /api/auth/register
    - Register new user

@POST /api/auth/login
    - Login user

@GET /api/auth/me
    - Return logged in user

*********************************************    
STORES

@GET /stores
    - Returns all stores

@GET /stores/:id
    - Returns one store

@POST /stores/update
    - Updates all stores

@POST /stores/update/location
    - Updates coordinates for all stores

*********************************************
PRODUCTS

@GET /products
    - Returns all products

@GET /procucts/:id
    - Returns one products

@POST /products/update
    - Updates all products

@POST /products/update/location
    - Updates coordinates for all products

*********************************************
STOCK

@GET /stocks
    - Returns all products

@GET /stocks/:id
    - Returns one products

@POST /stocks/update
    - Updates all products

@POST - /stocks/availiblility
    - Returns true or false depending if product is in stock.




