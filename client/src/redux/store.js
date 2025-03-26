import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer, { handleLogout } from "./user/userSlice";
import quoteReducer from "./quote/quoteSlice";
import contractReducer from "./contract/contractSlice";
import correspondenceReducer from "./correspondence/correspondenceSlice.js";
import cardReducer from "./card/cardSlice";
import persistStore from "redux-persist/es/persistStore";

const rootReducer = combineReducers({
  user: userReducer,
  quote: quoteReducer,
  contract: contractReducer,
  card: cardReducer,
  correspondence: correspondenceReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["user"],
  blacklist: ["quote"],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
const tokenMiddleware = (store) => (next) => async (action) => {
  if (action.type.endsWith("/rejected")) {
    const { statusCode } = action.payload || {};
    if (statusCode === 401) {
      store.dispatch(handleLogout());
    }
  }
  return next(action);
};
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(tokenMiddleware),
});

export const persistor = persistStore(store);
