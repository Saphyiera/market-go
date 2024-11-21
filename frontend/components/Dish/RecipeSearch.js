import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import RecipeSearchByName from "./RecipeSearchByName";
import RecipeSearchByIngredients from './RecipeSearchByIngredients';
import RecipeSearchByOwners from './RecipeSearchByOwners';

export default function RecipeSearch() {
    const [showOption, setShowOption] = useState(false);
    const [activeSearch, setActiveSearch] = useState(null); // Track active search type

    const handleSearchOption = (option) => {
        setActiveSearch(option === activeSearch ? null : option);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.headerContainer}
                onPress={() => setShowOption(!showOption)}
                accessible={true}
                accessibilityLabel="Toggle search options"
            >
                <Text style={styles.title}>Find Recipes</Text>
            </TouchableOpacity>

            {showOption && (
                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        onPress={() => handleSearchOption('name')}
                        style={[
                            styles.buttonContainer,
                            activeSearch === 'name' && styles.activeButton
                        ]}
                        accessible={true}
                        accessibilityLabel="Search by name"
                    >
                        <Text style={styles.buttonText}>By Name</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleSearchOption('ingredients')}
                        style={[
                            styles.buttonContainer,
                            activeSearch === 'ingredients' && styles.activeButton
                        ]}
                        accessible={true}
                        accessibilityLabel="Search by ingredients"
                    >
                        <Text style={styles.buttonText}>By Ingredients</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleSearchOption('owners')}
                        style={[
                            styles.buttonContainer,
                            activeSearch === 'owners' && styles.activeButton
                        ]}
                        accessible={true}
                        accessibilityLabel="Search by owners"
                    >
                        <Text style={styles.buttonText}>By Owners</Text>
                    </TouchableOpacity>
                </View>
            )}

            {activeSearch === 'name' && <RecipeSearchByName />}
            {activeSearch === 'ingredients' && <RecipeSearchByIngredients />}
            {activeSearch === 'owners' && <RecipeSearchByOwners />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        backgroundColor: 'cornflowerblue',
        padding: 8,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    optionsContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginLeft: 12,
        marginRight: 12,
        borderRadius: 8,
        elevation: 3,
    },
    buttonContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#adb5bd',
    },
    buttonText: {
        fontSize: 16,
        color: '#495057',
    },
});
