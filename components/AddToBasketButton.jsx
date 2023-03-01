import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { postClothesToBasket, deleteClothesFromBasket } from '../utils/api';
import { UserContext } from "../contexts/userContext";

const AddToBasketButton = ({ basket, setBasket, clothes }) => {
	const currentBasket = [...basket];
	const existingClothes = currentBasket?.filter(x => x.clothes_id === clothes.clothes_id);

	const [isAddedToBasket, setIsAddedToBasket] = useState(existingClothes?.length > 0 ? true : false);
	const [existingClothesInBasket, setExistingClothesInBasket] = useState(existingClothes[0]);

	const { user } = useContext(UserContext);

	useEffect(() => {
		const currentUpdatedBasket = [...basket];
		const existingCurrentClothes = currentUpdatedBasket.filter(x => x.clothes_id === clothes.clothes_id);

		setExistingClothesInBasket(existingCurrentClothes);

		if (existingCurrentClothes[0]) {
			setIsAddedToBasket(true);
		} else {
			setIsAddedToBasket(false);
		}
	}, [basket]);

	const addNewClothesToBasket = () => {
		setIsAddedToBasket(true);

			postClothesToBasket(user, {clothes_id: clothes.clothes_id})
				.then((clothesAddedToBasket) => {
					const { clothesBasket } = clothesAddedToBasket.data;

					const newClothesAddedToBasket = {
						"basket_id": clothesBasket.basket_id,
						"basket_count": clothesBasket.basket_count,
						"clothes_id": clothesBasket.clothes_id,
						"uid": clothesBasket.uid,
						"title": clothes.title,
						"item_img_url": clothes.item_img_url,
						"price": clothes.price,
					}

					setBasket([newClothesAddedToBasket, ...basket]);
			})
			.catch((err) => {
				setIsAddedToBasket(false);

				// need to add error handling here
				console.log("clothes hasn't been added to basket");
				console.log(err);
			});
	};

	const removeClothesFromBasket = () => {
			deleteClothesFromBasket(existingClothesInBasket[0].basket_id)
					.then(() => {
						setIsAddedToBasket(false);
						setBasket(currentBasket => currentBasket.filter(basket => basket.basket_id !== existingClothesInBasket[0].basket_id));
							// setIsRemoving(false);
					})
					.catch((err) => {	
							// need to add error handling here
							console.log(err);
							// setError(err);
					})
	};

  return (
		<View>
			{!isAddedToBasket ?
			<Pressable style={styles.adderButton} onPress={() => addNewClothesToBasket()}>
				 <Text style={styles.text}>Add to basket</Text>
			</Pressable> : 
			<Pressable style={styles.removerButton} onPress={() => removeClothesFromBasket()}>
				 <Text style={styles.text}>Remove from basket</Text>
			</Pressable>
			}
		</View>
	);
};

const styles = StyleSheet.create({
	adderButton: {
    height: 65,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 6,
    backgroundColor: '#008C83',
  },
	removerButton: {
		height: 65,
		width: 148,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    elevation: 6,
    backgroundColor: '#B8354E',
	},
  text: {
      fontSize: 18,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'white',
  },
});

export default AddToBasketButton;