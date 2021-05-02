import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { getFoodsFromCategory } from '../services';

const MAX_AMOUNT = 12;
const CATEGORIES_NUMBER = 5;

function Comidas() {
  const { foods, foodCategories, setFoodApiResults } = useContext(AppContext);
  const [clicked, setClicked] = useState({});
  if (!foods) return <p>Carregando...</p>;

  const handleClick = async (category) => {
    const response = await getFoodsFromCategory(category);
    if (!clicked[category]) {
      setClicked({
        [category]: true,
      });
      return setFoodApiResults(response);
    }
    setClicked({
      [category]: false,
    });
    return setFoodApiResults([]);
  };

  return (
    <>
      <Header title="Comidas" searchIcon />
      <button
        data-testid="All-category-filter"
        type="button"
        onClick={ () => { setFoodApiResults([]); setClicked([]); } }
      >
        All
      </button>
      { foodCategories
        && foodCategories.slice(0, CATEGORIES_NUMBER).map(({ strCategory }) => (
          <button
            data-testid={ `${strCategory}-category-filter` }
            key={ strCategory }
            type="button"
            onClick={ () => handleClick(strCategory) }
          >
            {strCategory}
          </button>
        )) }
      { foods && foods.slice(0, MAX_AMOUNT).map((food, index) => (
        <Link key={ food.idMeal } to={ `/comidas/${food.idMeal}` }>
          <div data-testid={ `${index}-recipe-card` }>
            <img
              data-testid={ `${index}-card-img` }
              src={ food.strMealThumb }
              alt={ food.strMeal }
              width="100px"
            />
            <p data-testid={ `${index}-card-name` }>{food.strMeal}</p>
          </div>
        </Link>
      )) }
      <Footer />
    </>
  );
}

export default Comidas;
