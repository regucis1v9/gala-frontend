import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateActiveComponent } from '../../actions/componentAction';
export default function CreateFolders() {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const token = localStorage.getItem('token')
    const API_URL = process.env.REACT_APP_API_URL;
    const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  useEffect(() => {
    dispatch(updateActiveComponent('create'));
  }, []);

  const handleSubmit = async () => {
    if (inputValue.length === 0) {
      setError("Nosaukums nevar būt tukšs");
      return;
    }
    
    if (inputValue.length > 255) {
      setError('Nosaukuma maksimālais garums ir 255 rakstzīmes');
      return;
    }

    setError(''); 
    try {
      const response = await fetch(`${API_URL}/api/createFolder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','Accept':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify({ 
          folder_name: inputValue 
        }),
      });

      if (!response.ok) {
        throw new Error('Radās kļūda izveidojot mapi');
      }

      const data = await response.json();
      console.log('Mape izveidota veiksmīgi', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="content-main flex-center">
      <input
        className='folder-input'
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Ievadi mapes nosaukumu"
      />
      <button className='submit-button' onClick={handleSubmit}>Izveidot mapi</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
