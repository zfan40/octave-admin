import { queryWork, removeWork, addWork } from '../services/api';

export default {
  namespace: 'work',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryWork, payload);
      const { current, total, size, list } = response.data;
      const formatterResponse = {
        list,
        pagination: {
          current,
          total,
          size,
        },
      };
      yield put({
        type: 'save',
        payload: formatterResponse,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addWork, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload }, { call }) {
      yield call(removeWork, payload);
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
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
