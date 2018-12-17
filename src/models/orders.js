import { queryOrders, updateOrders } from '../services/api';

export default {
  namespace: 'orders',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryOrders, payload);
      const { current, total, size, list } = response.data;
      const formatterResponse = {
        list,
        pagination: {
          current,
          total,
          size,
        },
      };

      console.log("fetch", formatterResponse)
      yield put({
        type: 'save',
        payload: formatterResponse,
      });
    },

    *update({ payload }, { call }) {
      console.log("update payload ",payload)
      const response = yield call(updateOrders, payload);

    }

  },

  reducers: {
    save(state, action) {
      console.log("reducers.save", state, action)
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
