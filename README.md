<<<<<<< HEAD
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
    
@DELETE /stores/:id
    - Deletes one store

*********************************************
PRODUCTS

@GET /products
    - Returns all products

@GET /procucts/:id
    - Returns one products

@POST /products/update
    - Updates all products
    
@DELETE /procucts/:id
    - Deletes one product

*********************************************
STOCK

@GET /stocks
    - Returns all stocks

@GET /stocks/:id
    - Returns one stocks

@POST /stocks/update
    - Updates all stocks

@POST - /stocks/availiblility
    - Returns true or false depending if product is in stock.
    
@DELETE /stocks/:id
   - Deletes one stock entry




