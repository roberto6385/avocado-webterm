import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useContextMenu} from 'react-contexify';
import {useDispatch, useSelector} from 'react-redux';

import {useDoubleClick} from '../../../hooks/useDoubleClick';
import {awsServerIcon, linuxServerIcon} from '../../../icons/icons';
import FavoriteContextMenu from '../../ContextMenus/FavoriteContextMenu';
import {Icon} from '../../../styles/components/icon';
import {
	ResourceItem,
	ResourceItemTitle,
} from '../../../styles/components/navigationBar';
import {authSelector} from '../../../reducers/api/auth';
import {
	remoteResourceAction,
	remoteResourceSelector,
} from '../../../reducers/remoteResource';
import {sshAction} from '../../../reducers/ssh';
import {sftpAction} from '../../../reducers/renewal';

const Favorite = ({data, indent}) => {
	const dispatch = useDispatch();
	const {selectedResource, resources, accounts, computingSystemServicePorts} =
		useSelector(remoteResourceSelector.all);
	const {userData} = useSelector(authSelector.all);
	const resource = useMemo(
		() => resources.find((v) => v.id === data.id),
		[resources, data.id],
	);

	const {show} = useContextMenu({
		id: data.id + '-favorites-context-menu',
	});

	const onClickFavorite = useDoubleClick(
		() => {
			const computingSystemPort = computingSystemServicePorts.find(
				(v) => v.id === data.id,
			);
			const account = accounts.find(
				(v) => v.resourceId === data.id && v.isDefaultAccount === true,
			);

			if (computingSystemPort.protocol === 'SSH2') {
				dispatch(
					sshAction.connectRequest({
						token: userData.access_token,
						host: computingSystemPort.host,
						port: computingSystemPort.port,
						user: account.user,
						password: account.password,
						id: computingSystemPort.id,
					}),
				);
			}
			if (computingSystemPort.protocol === 'SFTP') {
				dispatch(
					sftpAction.connect({
						resourceId: data.id,
					}),
				);
			}
		},
		() => {
			if (selectedResource === data.id) {
				dispatch(remoteResourceAction.setSelectedResource(null));
			} else {
				dispatch(remoteResourceAction.setSelectedResource(data.id));
			}
		},
		[
			selectedResource,
			data.id,
			userData,
			computingSystemServicePorts,
			accounts,
			dispatch,
		],
	);

	const openFavoriteContextMenu = useCallback(
		(e) => {
			e.preventDefault();
			dispatch(remoteResourceAction.setSelectedResource(data.id));
			show(e);
		},
		[data.id, dispatch, show],
	);

	// const onDragStart = useCallback(() => {
	// 	dispatch(remoteResourceAction.setSelectedResource(data.id));
	// }, [dispatch, data.id]);

	return (
		<>
			<ResourceItem
				data-id={data.id}
				onClick={onClickFavorite}
				onContextMenu={openFavoriteContextMenu}
				// draggable='true'
				selected={selectedResource === data.id ? 1 : 0}
				left={(indent * 11 + 8).toString() + 'px'}
			>
				{/*???????????? ??????????????????*/}
				<Icon
					size={'sm'}
					margin_right={'12px'}
					itype={
						selectedResource === data.id ? 'selected' : undefined
					}
				>
					{resource.data.osType === 'linux' && linuxServerIcon}
					{resource.data.osType === 'aws' && awsServerIcon}
				</Icon>
				<ResourceItemTitle>{resource.name}</ResourceItemTitle>
			</ResourceItem>

			<FavoriteContextMenu resourceId={data.id} />
		</>
	);
};

Favorite.propTypes = {
	data: PropTypes.object.isRequired,
	indent: PropTypes.number.isRequired,
};

export default Favorite;
