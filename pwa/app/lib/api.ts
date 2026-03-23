import axios from 'axios';

export const API_DOMAIN = typeof window !== "undefined" ? window.origin : (process.env.NEXT_PUBLIC_ENTRYPOINT || "");

export async function get(route: string, headers?: Record<string, string>) {
    return axios.get(API_DOMAIN + route, headers ? { headers } : undefined);
}

export async function deleteEntity(route: string, headers?: Record<string, string>) {
    return axios.delete(API_DOMAIN + route, headers ? { headers } : undefined);
}

export async function post(route: string, entity: object, headers?: Record<string, string>) {
    return axios.post(API_DOMAIN + route, entity, headers ? { headers } : undefined);
}

export async function put(route: string, entity: object, headers?: Record<string, string>) {
    return axios.put(API_DOMAIN + route, entity, headers ? { headers } : undefined);
}

export async function patch(route: string, entity: object, headers?: Record<string, string>) {
    return axios.patch(API_DOMAIN + route, entity, {
        headers: { 'Content-type': 'application/merge-patch+json', ...headers }
    });
}

export async function getClientBySlug(slug: string) {
    const response = await axios.get(API_DOMAIN + `/clients?slug=${encodeURIComponent(slug)}&pagination=false`, {
        headers: { 'Accept': 'application/ld+json' }
    });
    const members = response.data?.['hydra:member'] ?? response.data;
    if (!Array.isArray(members)) return null;
    return members.find((m: any) => m.slug === slug) ?? null;
}