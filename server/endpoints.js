const BASE_URL = 'https://www.systembolaget.se/api/assortment';
module.exports = {
    'STORES'  : `${BASE_URL}/stores/xml`,
    'PRODUCTS' : `${BASE_URL}/products/xml`,
    'STOCK' : `${BASE_URL}/stocks/xml`,
    'GEOCODE_API' : 'https://maps.googleapis.com/maps/api/geocode/json'
}