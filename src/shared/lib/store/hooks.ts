import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// ROADMAP Phase 6: 모든 컴포넌트에서 useDispatch / useSelector 대신 이 두 훅을 쓴다.
// 타입이 store에 자동 연결되어 RootState / AppDispatch를 매번 명시할 필요 없음.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
