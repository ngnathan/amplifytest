import { useState, useEffect } from 'react';
import API, { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import isEqual from 'lodash/isEqual';

import useAuth from './useAuth';

type ConfigType<VariableType extends Record<string, unknown>> = {
	query: string;
	key: string;
	variables?: VariableType;
};

const useGQLSubscription = <ItemType extends { id?: string }, VariablesType extends Record<string, unknown> = Record<string, unknown>>({
	config,
	itemData
}: {
	config?: ConfigType<VariablesType>;
	itemData?: ItemType;
} = {}): ItemType[] => {
	const { isAuthenticated } = useAuth();
	const [item, setItem] = useState<ItemType | undefined>(itemData);
	const [currentConfig, setCurrentConfig] = useState<ConfigType<VariablesType> | null>(null);

	useEffect(() => {
		if (config && !isEqual(config, currentConfig)) {
			console.log('setting config', config);
			console.log('currentConfig', currentConfig);
			setCurrentConfig(config);
		}
	}, [config, currentConfig]);

	useEffect(() => {
		if (!currentConfig || !isAuthenticated) return;
		const { query, key, variables } = currentConfig;
		if (!query || !key) return;

		console.log('getting subscription', key);

		const subscription = API.graphql({
			query,
			variables,
			authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
		}).subscribe({
			next: (payload: { value: { data: { [key: string]: ItemType } } }) => {
				try {
					const {
						value: {
							data: { [key]: item }
						}
					} = payload;
					setItem(item);
				} catch (error) {
					console.log('error inside', error);
					if (error instanceof Error) {
						console.error(`${error.message} - Check the key property: the current value is ${key}`);
					}
				}
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [currentConfig, isAuthenticated]);

	return item ? [item] : [];
};

export default useGQLSubscription;
