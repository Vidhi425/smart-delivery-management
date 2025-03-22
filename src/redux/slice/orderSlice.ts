import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Order {
    partner: string;
    customer: {
        name: string;
        phone: string;
        address: string;
    };
    orderNumber: string;
    _id: string;
    area: string;
    status: "Pending" | "Assigned" | "Picked" | "Delivered" | "Cancelled";
    lat?: number;
    lng?: number;
    scheduledFor :string;
    totalAmount:string;
    assignedTo:string;
}


export interface OrdersState{
    order: Order[],
    loading : boolean,
    error:string | null
}


const initialState: OrdersState = {
    order: [],
    loading: false,
    error: null,
  };

  export const fetchOrders = createAsyncThunk("/order/fetchOrders" , async()=>{
    const response = await axios.get("api/orders");
    return response.data.data
  })

  const ordersSlice = createSlice({
    name:"Orders",
    initialState,
    reducers:{},
    extraReducers : (builder)=>{
        builder.addCase(fetchOrders.pending ,(state)=>{
            state.loading=true;
        })
        .addCase(fetchOrders.fulfilled , (state,action)=>{
            state.loading= false;
            state.order = action.payload;
        })
        .addCase(fetchOrders.rejected , (state,action)=>{
            state.loading= false;
            state.error = action.error.message || "Failed";
        })
    },
  })

  export default ordersSlice.reducer;