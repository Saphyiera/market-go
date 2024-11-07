import './gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './frontend/components/Home/Home'
import Fridge from './frontend/components/Fridge/Fridge'
import Item from './frontend/components/Item/Item';
import Search from './frontend/components/Search/Search';
import AddItem from './frontend/components/Item/AddItem';
import Recipes from './frontend/components/Dish/Recipes';
import Recipe from './frontend/components/Dish/Recipe';
import Statistic from './frontend/components/Statistic/Statistic';
import Dish from './frontend/components/Dish/Dish';
import DishRecipe from './frontend/components/Dish/DishRecipe';
import Items from './frontend/components/Item/Items';
import Account from './frontend/components/Account/Account';
import Login from './frontend/components/Account/Login';
import Avatars from './frontend/components/Account/Avatars';
import Signup from './frontend/components/Account/Signup';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const RecipeStack = () => (
  <Stack.Navigator initialRouteName="Recipes">
    <Stack.Screen name="All Recipes" component={Recipes} options={{ headerShown: false }} />
    <Stack.Screen name="Recipe" component={Recipe} />
    <Drawer.Screen name='Ingredient' component={Item} />
  </Stack.Navigator>
);

const DishStack = () => (
  <Stack.Navigator initialRouteName='Dish Plan'>
    <Stack.Screen name='Dish Plan' component={Dish} options={{ headerShown: false }} />
    <Stack.Screen name="Dish Recipe" component={DishRecipe} />
    <Drawer.Screen name='Recipe Ingredient' component={Item} />
  </Stack.Navigator>
)

const ItemStack = () => (
  <Stack.Navigator initialRouteName='All Items' >
    <Stack.Screen name='All Items' component={Items} options={{ headerShown: false }} />
    <Drawer.Screen name='Item' component={Item} />
    <Drawer.Screen name='Add Item' component={AddItem} />
  </Stack.Navigator>
)

const AccountStack = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const userId = await AsyncStorage.getItem('userID');
        if (userId) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking user authentication", error);
        setIsAuthenticated(false);
      }
    };

    checkUserAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={isAuthenticated ? 'Account' : 'Login'}>
      <Stack.Screen name='Profile' component={Account} options={{ headerShown: false }} />
      <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
      <Stack.Screen name='Signup' component={Signup} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const AppNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName='Home'>
      <Drawer.Screen name='Account' component={AccountStack} />
      <Drawer.Screen name='Avatars' component={Avatars} />
      <Drawer.Screen name='Home' component={Home} />
      <Drawer.Screen name='Items' component={ItemStack} />
      <Drawer.Screen name='Fridge' component={Fridge} initialParams={{ userId: 0 }} />
      <Drawer.Screen name='Recipes' component={RecipeStack} />
      <Drawer.Screen name='Dish' component={DishStack} />
      <Drawer.Screen name='Search' component={Search} />
      <Drawer.Screen name='Statistic' component={Statistic} />
    </Drawer.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}