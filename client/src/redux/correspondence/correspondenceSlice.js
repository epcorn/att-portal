import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  inputData: {},
  fetching: false,
};

export const createCorrespondence = createAsyncThunk(
  "correspondence/create",
  async (inputData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("file", inputData.file);

      // Append other fields
      formData.append("title", inputData.title);
      formData.append("description", inputData.description);
      formData.append("category", inputData.category);
      formData.append("tags", inputData.tags);
      formData.append("direction", inputData.direction);
      // Append sender information
      formData.append("sender[name]", inputData.sender.name);
      formData.append("sender[designation]", inputData.sender.designation);
      formData.append("sender[organization]", inputData.sender.organization);
      formData.append("sender[contact][email]", inputData.sender.contact.email);
      formData.append("sender[contact][phone]", inputData.sender.contact.phone);

      // Append parent document reference
      if (inputData.quotationId) {
        formData.append("quotationId", inputData.quotationId);
      }
      if (inputData.contractId) {
        formData.append("contractId", inputData.contractId);
      }

      const response = await fetch("/api/v1/correspondence/files", {
        method: "POST",
        body: formData,
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
export const getCorrespondence = createAsyncThunk(
  "correspondence/get",
  async (inputData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/v1/correspondence/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Add this line
        },
        body: JSON.stringify(inputData), // Convert object to JSON string
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const deleteDocument = createAsyncThunk(
  "document/delete",
  async (inputData, { rejectWithValue }) => {
    const { file, correspondenceId } = inputData;
    try {
      const response = await fetch(
        `/api/v1/correspondence/${correspondenceId}/delete/file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Add this line
          },
          body: JSON.stringify(file), // Convert object to JSON string
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const correspondenceSlice = createSlice({
  name: "correspondence",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCorrespondence.pending, (state) => {
        state.fetching = true;
      })
      .addCase(createCorrespondence.fulfilled, (state) => {
        state.fetching = false;
      })
      .addCase(createCorrespondence.rejected, (state, { payload }) => {
        state.fetching = false;
        toast.error(payload.message);
      })
      .addCase(getCorrespondence.pending, (state) => {
        state.fetching = true;
      })
      .addCase(getCorrespondence.fulfilled, (state) => {
        state.fetching = false;
      })
      .addCase(getCorrespondence.rejected, (state, { payload }) => {
        state.fetching = false;
        toast.error(payload.message);
      });
  },
});

export default correspondenceSlice.reducer;
