// src/api/roomApi.js
import axiosClient from './axiosClient';

const roomApi = {
    getAllRooms: () => axiosClient.get('/rooms'),
    createRoom: (data) => axiosClient.post('/rooms', data),
    getRoomById: (id) => axiosClient.get(`/rooms/${id}`),
    updateRoom: (id, data) => axiosClient.put(`/rooms/${id}`, data),
    deleteRoom: (id) => axiosClient.delete(`/rooms/${id}`),
};

export default roomApi;
