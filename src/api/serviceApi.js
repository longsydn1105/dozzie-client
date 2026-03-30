import axiosClient from './axiosClient.js';

const serviceApi = {
    getAllPackages: () => axiosClient.get('/service-packages'),
    createPackage: (data) => axiosClient.post('/service-packages', data),
};

export default serviceApi;
