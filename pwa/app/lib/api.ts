import axios from 'axios';


const ENV = (!process.env.NEXT_PUBLIC_NODE_ENV || process.env.NEXT_PUBLIC_NODE_ENV === "development") ? "development" : "production" ;
export const API_DOMAIN = ENV === "development" ? process.env.NEXT_PUBLIC_DEV_API_DOMAIN : process.env.NEXT_PUBLIC_PROD_API_DOMAIN;

export async function get(route: string) {
    return axios.get(API_DOMAIN + route);
}

export async function deleteEntity(route: string) {
    return axios.delete(API_DOMAIN + route);
}

export async function post(route: string, entity: object) {
    return axios.post(API_DOMAIN + route, entity);
}

export async function put(route: string, entity: object) {
    return axios.put(API_DOMAIN + route, entity);
}

export async function patch(route: string, entity: object) {
    return axios.patch(API_DOMAIN + route, entity, { headers: {'Content-type': 'application/merge-patch+json'} });
}