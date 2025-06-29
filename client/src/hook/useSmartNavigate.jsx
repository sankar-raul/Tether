import { useNavigate, useLocation} from 'react-router-dom'

export default function useSmartNavigate() {
  const navigate = useNavigate()
  const location = useLocation()

  return (to, opts = {}) => {
    if (location.pathname !== to) {
      navigate(to, opts)
    }
  }
}
