import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
const TabsLayout = () => {
    return(
        <Tabs 
        screenOptions={{
            tabBarActiveTintColor: "blue", // Active tab color

            tabBarItemStyle:{
                flex: 1,
                maxWidth: "19%",
            },

            tabBarStyle: { 
                backgroundColor: "#f7f9fbff", // Tab bar background color
                borderTopWidth: 1, // Tab bar border width
                borderTopColor: "light grey", // Tab bar border color
                height: 80, // Tab bar height
                paddingBottom: 10, // Tab bar bottom padding
                paddingTop: 10, // Tab bar top padding
                paddingHorizontal: 10,
                alignItems: "center",

            }, 
            tabBarLabelStyle: {
                fontSize: 9.5, // Tab label font size
                fontWeight: "700", // Tab label font weight
            },
            headerShown: false, // Hide header for all screens  
        }}
        
        >

            <Tabs.Screen 
                name="MyProgress" 
                options={{ 
                    title: "MyProgress",
                    tabBarIcon:({color, size}) => (
                        <MaterialIcons name='query-stats' color={color} size={size} />
                    )
            }} 
        />
            <Tabs.Screen 
                name="MyWorkouts" 
                options={{ 
                    title: "MyWorkouts",
                    tabBarIcon:({color, size}) => (
                        <MaterialCommunityIcons name='dumbbell' color={color} size={size} />
                    )
            }} 
        />
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: "Home",
                    tabBarIcon:({color, size}) => (
                        <Ionicons name='camera' color={color} size={size} />
                    )
            }} 
        />
        <Tabs.Screen 
        name="MyFridge" 
            options={{ 
                title: "MyFridge", 
                tabBarIcon:({color, size}) => (
                    <MaterialCommunityIcons name='fridge-outline' color={color} size={size} />
                ) 
            }} 
        />
        <Tabs.Screen
        name="MyMeals"
        options={{
            title: "MyMeals",
            tabBarIcon:({color, size}) => (
                <Entypo name='bowl' color={color} size={size} />
            )
        }}
        />
        </Tabs>
    )
}
export default TabsLayout;