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
    *fetch({ payload }, { all,call, put }) {
      const response = yield call(queryWork, payload);
      if (!response.data) return

// method 1, await one by one
      // for (let i = 0; i <= response.data.list.length - 1; i++) {
      //   const userVORes = yield call(getMusixiserById, {
      //     id: response.data.list[i].userId,
      //   });
      //   response.data.list[i].userVO = userVORes.data;
      // }
// method 2, saga all, similar to promise all
      const length = response.data.list.length
      const a = new Array(length).fill(1).map((a,i)=> i) // [0,1,2,3,4,5,...]
      console.log(a)
      const b = a.map((index)=>call( getMusixiserById, {
          id: response.data.list[index].userId,
      }))
      console.log(b)
      const userVOsRes = yield all(b)
      console.log('complete')
      for (let i = 0; i <= length - 1; i++) {
        response.data.list[i].userVO = userVOsRes[i].data;
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
