import { queryProduct, removeProduct, addProduct, updateProduct } from '../services/api';

export default {
  namespace: 'products',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryProduct, payload);
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
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addProduct, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload }, { call }) {
      console.log("update payload ",payload)
      const response = yield call(updateProduct, payload);

    },
    *remove({ payload }, { call }) {
      yield call(removeProduct, payload);
      // const response = yield call(removeWork, payload);
      // yield put({
      //   type: 'save',
      //   payload: response,
      // });
      // if (callback) callback();
    },
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
