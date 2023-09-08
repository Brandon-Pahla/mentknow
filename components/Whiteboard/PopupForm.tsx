import React, { useState, ChangeEvent } from 'react';
import { useMutation } from '../../liveblocks.config';
import { nanoid } from 'nanoid';
import { LiveObject } from '@liveblocks/client';

interface PopupFormProps {
  onSubmit: (data: { title: string; category: string }) => void;
}

export function PopupForm({ onSubmit }: PopupFormProps) {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const handleSubmit = () => {
    // Check if either title or category is empty
    if (!title || !category) {
      alert('Please enter both title and category.');
      return;
    }
    // Call the onSubmit callback with the title and category
    onSubmit({ title, category });

    // Clear the input fields
    setTitle('');
    setCategory('');
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  return (
    <div>
      <h2>Enter Title and Category</h2>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      <div>
        <label>Category:</label>
        <input
          type="text"
          value={category}
          onChange={handleCategoryChange}
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

