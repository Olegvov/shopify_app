import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Banner,
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Link,
  Thumbnail,
} from '@shopify/polaris';
import store from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';

// GraphQL query to retrieve products by IDs.
// The price field belongs to the variants object because
// variations of a product can have different prices.
const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              id
              altText
            }
          }
        }
		media(first: 5) {
			edges {
			  node {
				alt
				  mediaContentType
				  preview {
					image {
					  id
					  altText
					  originalSrc
					}
				  }
			  }
			}
		  }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
	  
    }
  }
  
`;
class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  render() {
    const app = this.context;

    return (
      // GraphQL query to retrieve products and their prices
      <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get('ids') }}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;
			
			
          return (

		    <Card>
              <ResourceList // Defines your resource list component
                showHeader
                resourceName={{ singular: 'Product', plural: 'Products' }}
                items={data.nodes}
				
                renderItem={item => {
                  const media = (
                    <Thumbnail
                      source={
                        item.media.edges[0]
                          ? item.media.edges[0].node.preview.image.originalSrc
                          : ''
                      }
                    />
                  );
                  const price = item.variants.edges[0].node.price;
				 
                  return (
                    <ResourceList.Item
                      id={item.id}
                      media={media}
                      accessibilityLabel={`View details for ${item.title}`}
                      onClick={() => {
                        store.set('item', item);
                      }}
                    >
                      <Stack>
                        <Stack.Item fill>
                        <Banner
                            title=""
                            status="warning"
                            secondaryAction={{
                              content: "Preview product",
                              url: 'https://vyontsek-dev-store.myshopify.com/products/'+item.handle,
                              external: true
                            }}
                          >
                           <h3>
                          <TextStyle variation="strong">
                         {item.title}
                          </TextStyle>
                            </h3>
                          </Banner>
                         
                        </Stack.Item>
                        <Stack.Item>
                          <p>${price}</p>
                        </Stack.Item>
                      </Stack>
                    </ResourceList.Item>
                    );
                  }}
                />
              </Card>
            );
          }}
        </Query>
      );
    }
  }
export default ResourceListWithProducts;