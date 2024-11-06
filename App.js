import './gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
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

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const RecipeStack = () => (
  <Stack.Navigator initialRouteName="Recipes">
    <Stack.Screen name="All Recipes" component={Recipes} />
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

const AppNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName='Home'>
      <Drawer.Screen name='Account' component={Account} initialParams={{ userId: 0 }} />
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