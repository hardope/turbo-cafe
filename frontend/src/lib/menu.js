import {api} from '@lib/api';

const createMenuItem = async (name, description, price, wait_time_low, wait_time_high, image) => {
    try {
        const response = await api.post('/menu/vendor/create', {
            name,
            description,
            price,
            wait_time_low,
            wait_time_high,
            image,
        }, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log("Menu item created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating menu item:", error);
        throw new Error(error.response?.data?.message || "Failed to create menu item");
    }
}

const searchMenuItems = async (query) => {
    try {
        const response = await api.get(`/menu/search?q=${query}`);
        console.log("Menu items searched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error searching menu items:", error);
        throw new Error(error.response?.data?.message || "Failed to search menu items");
    }
}


const updateMenuItem = async (id, name, description, price, wait_time_low, wait_time_high, image) => {
    try {
        const response = await api.put(`/menu/${id}/update`, {
            name,
            description,
            price,
            wait_time_low,
            wait_time_high,
            image,
        }, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log("Menu item updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating menu item:", error);
        throw new Error(error.response?.data?.message || "Failed to update menu item");
    }
}
  
const activateMenuItem = async (id) => {
    try {
        const response = await api.patch(`/menu/${id}/toggle-availability`);
        console.log("Menu item availability toggled successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error toggling menu item availability:", error);
        throw new Error(error.response?.data?.message || "Failed to toggle menu item availability");
    }
}

const getMyMenuItems = async () => {
    try {
        const response = await api.get('/menu/vendor/my-menus/');
        console.log("My menu items fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching my menu items:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch my menu items");
    }
}

const getMenuItems = async () => {
    try {
        const response = await api.get('/menu/');
        console.log("Menu items fetched successfully ---- :", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching menu items:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch menu items");
    }
}

export {
    createMenuItem,
    updateMenuItem,
    activateMenuItem,
    getMyMenuItems,
    getMenuItems,
    searchMenuItems
}