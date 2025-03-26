import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  quotations: [],
  totalQuotations: "",
  todayQuotations: "",
  approvedCount: "",
  approvePending: "",
  contractified: "",
  loading: false,
  showMore: true,
};

export const uploadFiles = createAsyncThunk(
  "upload/files",
  async (data, { rejectWithValue }) => {
    try {
      const { file, name } = data;
      const images = Array.from(file);
      const form = new FormData();
      images.forEach((img) => {
        form.append("images", img);
      });

      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const result = await response.json();
      result.name = name;
      return result;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);
export const createQuote = createAsyncThunk(
  "create/Quote",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/v1/quotation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
export const showMoreQuotes = createAsyncThunk(
  "showMore/quotes",
  async ({ startIndex, extraQuery = "" }, { rejectWithValue }) => {
    try {
      let url = `/api/v1/quotation/getQuotes?startIndex=${startIndex}`;
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
export const getQuotes = createAsyncThunk(
  "get/quotes",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/getQuotes?${data}`);
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
export const getSingleQuote = createAsyncThunk(
  "get/singleQuote",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/${data}`);
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
export const approve = createAsyncThunk(
  "approve/singleQuote",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/approve/${data}`);
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
export const searchQuotes = createAsyncThunk(
  "search/quotes",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/getQuotes?${data}`);
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
export const docxData = createAsyncThunk(
  "get/docxdata",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/docx/${data}`);
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
export const archiveData = createAsyncThunk(
  "get/archivedata",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/archive/${data}`);
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
export const updateQuote = createAsyncThunk(
  "update/quote",
  async (data, { rejectWithValue }) => {
    const { id, quote, message, modified } = data;
    try {
      const response = await fetch(`/api/v1/quotation/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote, message, modified }),
      });
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
export const makeContract = createAsyncThunk(
  "quote/contract",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/contract/create/${data}`);
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
export const deleteQuote = createAsyncThunk(
  "quote/delete",
  async (data, { rejectWithValue }) => {
    console.log(data);
    try {
      const response = await fetch(`/api/v1/quotation/delete/${data}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const createGroup = createAsyncThunk(
  "group/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
export const getGroups = createAsyncThunk(
  "group/getAll",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/group`);
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
export const getGroup = createAsyncThunk(
  "group/get",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/quotation/group/${data}`);
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
export const quoteSlice = createSlice({
  name: "quote",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGroup.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(getGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getGroup.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(getGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGroups.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getGroups.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(uploadFiles.pending, (state) => {
        state.loading = true;
        state.newTicket.modeDetails.email.emailCopy = "";
      })
      .addCase(uploadFiles.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.name === "email") {
          state.newTicket.modeDetails.email.emailCopy = payload.link;
        }
        if (payload.name === "inspection") {
          state.newTicket.modeDetails.inspection.images.push(payload.link);
        }
        if (payload.name === "ticketImage") {
          state.newTicket.ticketImage = payload.link;
        }
        toast.success(payload.message);
      })
      .addCase(uploadFiles.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(createQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuote.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quotations.push(payload.result);
        state.quotations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        state.todayQuotations = state.todayQuotations + 1;
        state.totalQuotations = state.totalQuotations + 1;
        toast.success(payload.message);
      })
      .addCase(createQuote.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload.message);
      })
      .addCase(showMoreQuotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(showMoreQuotes.fulfilled, (state, { payload }) => {
        const newData = [...state.quotations, ...payload.result];
        state.loading = false;
        state.quotations = newData;
        if (payload.result.length < 9) {
          state.showMore = false;
        } else {
          state.showMore = true;
        }
      })
      .addCase(showMoreQuotes.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })

      .addCase(searchQuotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchQuotes.fulfilled, (state, { payload }) => {
        state.quotations = payload.result;
        state.loading = false;
        state.todayQuotations = payload.todayQuotes;
        state.totalQuotations = payload.totalQuotes;
        state.approvedCount = payload.approvedCount;
        state.approvePending = payload.approvePending;
        state.contractified = payload.contractified;
        if (payload.result.length < 9) {
          state.showMore = false;
        } else {
          state.showMore = true;
        }
      })
      .addCase(searchQuotes.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(getQuotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getQuotes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quotations = payload.result;
        state.todayQuotations = payload.todayQuotes;
        state.totalQuotations = payload.totalQuotes;
        state.approvedCount = payload.approvedCount;
        state.approvePending = payload.approvePending;
        state.contractified = payload.contractified;
        if (payload.result.length < 9) {
          state.showMore = false;
        } else {
          state.showMore = true;
        }
      })
      .addCase(getQuotes.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(getSingleQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleQuote.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getSingleQuote.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(approve.pending, (state) => {
        state.loading = true;
      })
      .addCase(approve.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quotations = state.quotations.filter(
          (quote) => quote._id !== payload.result._id
        );
        state.quotations.push(payload.result);
        state.quotations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        toast.success(payload.message);
      })
      .addCase(approve.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(docxData.pending, (state) => {
        state.loading = true;
      })
      .addCase(docxData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(docxData.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(updateQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuote.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quotations = state.quotations.filter(
          (quote) => quote._id !== payload.result._id
        );
        state.quotations.push(payload.result);
        state.quotations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        state.todayQuotations = state.todayQuotations + 1;
        state.totalQuotations = state.totalQuotations + 1;
        toast.success(payload.message);
      })
      .addCase(updateQuote.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload.message);
      })
      .addCase(archiveData.pending, (state) => {
        state.loading = true;
      })
      .addCase(archiveData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(archiveData.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(makeContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(makeContract.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quotations = state.quotations.filter(
          (quote) => quote._id !== payload.result._id
        );
        state.quotations.push(payload.result);
        state.quotations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        toast.success(payload.message);
      })
      .addCase(makeContract.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload);
      })
      .addCase(deleteQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteQuote.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quotations = state.quotations.filter(
          (contract) => contract._id !== payload.result._id
        );
        state.quotations.push(payload.result);
        state.quotations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        state.totalQuotations = state.totalQuotations - 1;
        state.todayQuotations = state.todayQuotations - 1;
        toast.success(payload.message);
      })
      .addCase(deleteQuote.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload.message);
      });
  },
});
export const {
  updateIssueField,
  handleMode,
  handlePhoneFilds,
  handleInspection,
  setCreator,
  setSelectedService,
  setInit,
} = quoteSlice.actions;

export default quoteSlice.reducer;
