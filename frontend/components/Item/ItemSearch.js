import ItemSearchBar from "./ItemSearchBar";
import { SERVER_IP, PORT } from "../../../backend/constant";

const handleSearch = async (q = { query: '', type: 'name' }) => {
    const { query, type } = q;
    console.log(query, type);
    const endpoint = (type === 'ID' ? `?id=${query}` : `?name=${query}`);
    try {
        const response = await fetch(`http://${SERVER_IP}:${PORT}/item${endpoint}`);
        const data = await response.json();
        console.log(data);
    }
    catch (error) {
        console.log("Here: " + error);
    }
}

export default function ItemSearch() {
    return <>
        <ItemSearchBar onSearch={handleSearch}></ItemSearchBar>
    </>;
}