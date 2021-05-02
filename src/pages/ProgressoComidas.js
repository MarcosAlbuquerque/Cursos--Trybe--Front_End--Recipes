import React, { useContext, useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router';
import copy from 'clipboard-copy';
import CheckBoxProgress from '../components/CheckboxProgress';
import { AppContext } from '../context/AppContext';
import { getFoodIdDetails } from '../services';
import shareImg from '../images/shareIcon.svg';
import whiteHeartImg from '../images/whiteHeartIcon.svg';
import blackHeartImg from '../images/blackHeartIcon.svg';

const checkFavorite = (recipeId) => {
  const favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
  if (favorites.find((recipe) => recipe.id === recipeId)) return true;
  return false;
};

const ProgressoComidas = () => {
  const [stepsFinished, setStepsFinished] = useState(1);
  const [idDetails, setIdDetails] = useState([]);
  const { id } = useParams();
  const [redirect, setRedirect] = useState(false);
  const [linkShared, setLinkShared] = useState(false);
  // const localData = JSON.parse(localStorage.getItem('inProgressMeals'));

  const {
    favoriteRecipe,
    removeFromFavorite,
    finishRecipe,
    handleProgressRecipes,
    handleIngredientsUsed,
  } = useContext(AppContext);

  let stepsLimit = 1;
  const getIngredients = () => {
    const ingredients = Object.entries(idDetails).filter((details) => {
      const condition1 = details[0].includes('Ingredient');
      const condition2 = details[1] !== '' && details[1] !== null;
      return condition1 && condition2;
    });
    const measure = Object.entries(idDetails)
      .filter((details) => details[0].includes('Measure'));
    const ingredientsArray = ingredients.reduce((acc, curr, index) => {
      acc.push({ name: curr[1], index });
      return acc;
    }, []);
    const measuresArray = measure.reduce((acc, curr, index) => {
      acc.push({ measure: curr[1], index });
      return acc;
    }, []);
    return ingredientsArray.map((ingredient) => {
      const measurament = measuresArray
        .filter((quantity) => ingredient.index === quantity.index);
      return { name: ingredient.name, measure: measurament[0].measure };
    });
  };
  const fetchDetails = async (identification) => {
    const results = await getFoodIdDetails(identification);
    setIdDetails(results);
  };
  const handleShare = () => {
    const { idMeal } = idDetails;
    copy(`http://localhost:3000/comidas/${idMeal}`);
    setLinkShared(true);
  };

  const handleFavorite = () => {
    const { idMeal, strMeal, strArea, strCategory, strMealThumb } = idDetails;
    if (!checkFavorite(idMeal)) {
      favoriteRecipe({
        id: idMeal,
        type: 'comida',
        area: strArea,
        category: strCategory,
        alcoholicOrNot: '',
        name: strMeal,
        image: strMealThumb,
      });
    } else {
      removeFromFavorite(idMeal);
    }
  };

  const handleFinishRecipe = () => {
    const {
      strMealThumb,
      strMeal, strCategory, idMeal, strArea, strTags } = idDetails;
    const doneInfos = {
      id: idMeal,
      type: 'comida',
      area: strArea,
      category: strCategory,
      alcoholicOrNot: '',
      name: strMeal,
      image: strMealThumb,
      doneDate: new Date().toLocaleDateString('pt-BR'),
      tags: [...strTags.split(',')],
    };
    finishRecipe(doneInfos);
    setRedirect(true);
  };

  useEffect(() => {
    fetchDetails(id);
  }, [id]);

  if (!idDetails) return <p>Carregando...</p>;
  const {
    strMealThumb,
    strMeal, strCategory, strInstructions, idMeal } = idDetails;
  return (
    <div>
      <img src={ strMealThumb } alt={ strMeal } data-testid="recipe-photo" />
      <h2 data-testid="recipe-title">{strMeal}</h2>
      <button type="button" onClick={ () => handleShare() }>
        <img data-testid="share-btn" src={ shareImg } alt="Compartilhar" />
      </button>
      { linkShared && <p>Link copiado!</p> }
      <button type="button" onClick={ handleFavorite }>
        <img
          data-testid="favorite-btn"
          src={ checkFavorite(idMeal) ? blackHeartImg : whiteHeartImg }
          alt="Favoritas"
        />
      </button>
      <p data-testid="recipe-category">{strCategory}</p>
      <div className="ingredient-steps">
        { idDetails && getIngredients().map((ingredient, index) => {
          stepsLimit += 1;
          return (
            <CheckBoxProgress
              ingredient={ ingredient }
              index={ index }
              key={ index }
              setStepsFinished={ setStepsFinished }
              stepsFinished={ stepsFinished }
              ingredientsUsed={ handleIngredientsUsed }
              inProgressRecipe={ handleProgressRecipes }
              idRecipe={ idMeal }
              type="meals"
            />);
        }) }
      </div>
      <p data-testid="instructions">{strInstructions}</p>
      <button
        type="button"
        data-testid="finish-recipe-btn"
        disabled={ stepsFinished < stepsLimit }
        onClick={ handleFinishRecipe }
      >
        Finalizar Receita
      </button>
      {redirect ? <Redirect to="/receitas-feitas" /> : null}
    </div>
  );
};

export default ProgressoComidas;
