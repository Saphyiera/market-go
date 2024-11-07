function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatPlans(rawData) {
    return rawData.reduce((acc, item) => {
        const formattedDate = formatDate(item.DateToBuy);

        let dateEntry = acc.find(plan => plan.dateToBuy === formattedDate);
        if (!dateEntry) {
            dateEntry = { dateToBuy: formattedDate, listItem: [] };
            acc.push(dateEntry);
        }

        dateEntry.listItem.push({
            itemName: item.ItemName,
            amount: item.Amount
        });

        return acc;
    }, []);
}

function formatFridgeItems(data) {
    return data.map(item => ({
        ...item,
        ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
        ExpireDate: formatDate(item.ExpireDate)
    }));
}

function formatRecipes(data) {
    return data.map(item => ({
        ...item,
        RecipeImg: item.RecipeImg ? item.RecipeImg.toString('base64') : null,
    }))
}

function formatRecipe(data) {
    return {
        ...data,
        RecipeImg: data.RecipeImg ? data.RecipeImg.toString('base64') : null,
    };
}

function formatItem(data) {
    return data.map(item => ({
        ...item,
        ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
    }))
}

function formatUserInfo(data) {
    return {
        ...data,
        Avatar: data.Avatar ? data.Avatar.toString('base64') : null,
    }
}

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const isValidPhoneNumber = (phone) => /^\d{10,15}$/.test(phone);

module.exports = {
    formatPlans,
    formatFridgeItems,
    formatRecipes,
    formatRecipe,
    formatItem,
    formatUserInfo,
    isValidEmail,
    isValidPhoneNumber
}
