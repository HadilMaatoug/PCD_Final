import { Link } from 'react-router-dom';

const NavigationLink = (props) => {
  return (
    <Link 
      className='nav-link'
      to={props.to} 
      style={{
        background: props.bg,
        color: props.textColor
      }}
      onClick={props.onClick}
    >
      {props.text}
    </Link>
  );
};

export default NavigationLink;