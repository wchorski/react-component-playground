import styled from 'styled-components'


export const StyledOverlayMenu = styled.div`
  background-color: #2b2c2a;
  padding: 1em;
  width: 15em;
  border-radius: 0 0 0 10px;

  
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10000;
  
  cursor: pointer;
  transform: translateX(15em);
  transition: 1s;

  .select-input{
    color: #2b2c2a;
    cursor: pointer;
  }

  button.handle{
    background-color: #2b2c2a;
    border-radius: 10px 0 0 10px;
    border: none;

    position: absolute;
    left: -2em;
    top: 0;
    padding: 1em;
  }


  &:hover{
    transform: translateX(0);
  }
`