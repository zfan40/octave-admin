import { queryMusixiser, removeMusixiser, addMusixiser, updateMusixiser, getMusixiserById } from '../services/api';

export default {
  namespace: 'musixiser',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    one: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryMusixiser, payload);
      console.log('!!!!!', response);
      // 缺少分页信息！
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
    *getById({ payload }, { call, put }) {
      const response = yield call(getMusixiserById, payload);
      yield put({
        type: 'saveOne',
        payload: response,
      });
    },
    // IMPORTANT: for operations like add, update, remove
    // after api call, directly refresh data at page.js in callback
    *add({ payload }, { call }) {
      yield call(addMusixiser, payload);
    },
    *update({ payload }, { call }) {
      yield call(updateMusixiser, payload);
    },
    *remove({ payload }, { call }) {
      yield call(removeMusixiser, payload);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveOne(state, action) {
      return {
        ...state,
        one: action.payload,
      };
    },
  },
};
