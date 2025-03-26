import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  cards: [],
  loading: false,
  showMore: true,
};

export const showMoreCard = createAsyncThunk(
  "cardShowMore/cards",
  async ({ startIndex, extraQuery = "" }, { rejectWithValue }) => {
    try {
      let url = `/api/v1/contract/getcontracts?startIndex=${startIndex}`;
      if (extraQuery) {
        url += `&${extraQuery}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);
export const getSingleCard = createAsyncThunk(
  "Cardget/singleQuote",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/contract/${data}`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);
export const incPrintCount = createAsyncThunk(
  "print/inc",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/contract/print/${data}`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);
export const searchCards = createAsyncThunk(
  "search/cards",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/contract/getContracts?${data}`);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const cardSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    setInit: (state) => {
      state.cards = initialState.cards;
      state.loading = initialState.loading;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(showMoreCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(showMoreCard.fulfilled, (state, { payload }) => {
        const newData = [...state.cards, ...payload.result];
        state.loading = false;
        state.cards = newData;
        if (payload.result.length < 9) {
          state.showMore = false;
        } else {
          state.showMore = true;
        }
      })
      .addCase(showMoreCard.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })

      .addCase(searchCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCards.fulfilled, (state, { payload }) => {
        state.cards = payload.result;
        state.loading = false;
        if (payload.result.length < 9) {
          state.showMore = false;
        } else {
          state.showMore = true;
        }
      })
      .addCase(searchCards.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(getSingleCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getSingleCard.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(incPrintCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(incPrintCount.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.cards = state.cards.filter(
          (card) => card._id !== payload.result._id
        );
        state.cards.push(payload.result);
        state.cards.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        toast.success(payload.message);
      })
      .addCase(incPrintCount.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload.message);
      });
  },
});
export const { setInit } = cardSlice.actions;

export default cardSlice.reducer;
