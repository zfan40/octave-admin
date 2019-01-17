import { queryWork, removeWork, addWork, updateWork, getMusixiserById } from '../services/api';

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
      for (let i = 0; i <= response.data.list.length - 1; i++) {
        const userVORes = yield call(getMusixiserById, {
          id: response.data.list[i].userId,
        });
        response.data.list[i].userVO = userVORes.data;
      }
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
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateWork, payload);
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
