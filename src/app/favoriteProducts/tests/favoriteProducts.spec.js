describe('Component: FavoriteProducts', function(){
    describe('State: favoriteProducts', function(){
        var favoriteProductState;
        beforeEach(inject(function(){
            favoriteProductState = state.get('favoriteProducts');
            spyOn(ocParametersService, 'Get');
            spyOn(oc.Me, 'ListProducts');
        }));
        it('should resolve Parameters', inject(function(){
            injector.invoke(favoriteProductState.resolve.Parameters);
            expect(ocParametersService.Get).toHaveBeenCalled();
        }));
        it('should resolve FavoriteProducts', inject(function(){
            injector.invoke(favoriteProductState.resolve.FavoriteProducts);
            var mockFilter = mock.User.xp.FavoriteProducts.join('|');
            expect(mock.Parameters.filters.ID).toBe(mockFilter);
            expect(oc.Me.ListProducts).toHaveBeenCalledWith(mock.Parameters);
        }));
    });
    describe('Directive: ocFavoriteProduct', function(){
        var element,
            directiveScope,
            originalFaves,
            addedFaves,
            favedClass,
            unfavedClass;
        beforeEach(function(){
            originalFaves = ['FavProd1', 'FavProd2'];
            addedFaves = ['FavProd1', 'FavProd2', 'PRODUCT_ID'];
            favedClass = "faved";
            unfavedClass = "unfaved"

            scope.currentUser = mock.User;            
            scope.currentUser.xp.FavoriteProducts = originalFaves;
            scope.product = mock.Product;
            element = compile('<button oc-favorite-product ' 
                            + 'current-user="currentUser" ' 
                            + 'product="product" '
                            + 'favorite-class=' + favedClass + ' '
                            + 'non-favorite-class=' + unfavedClass + '></button>')(scope);
            directiveScope = element.isolateScope();
        });

        it('should initialize the isolate scope', function(){
            expect(directiveScope.product).toEqual(mock.Product);
            expect(directiveScope.currentUser).toEqual(mock.User);
            expect(directiveScope.favoriteClass).toEqual(favedClass);
            expect(directiveScope.nonFavoriteClass).toEqual(unfavedClass);
        })
        describe('checkHasFavorites', function(){
            beforeEach(function(){
                spyOn(oc.Me, 'Patch').and.returnValue(dummyPromise);
            });
            it('should set vm.hasFavorites to true if current user has favorite products', function(){
                directiveScope.currentUser.xp.FavoriteProducts = originalFaves;
                directiveScope.checkHasFavorites();
                expect(oc.Me.Patch).not.toHaveBeenCalled();
                expect(directiveScope.hasFavorites).toBe(true);
            });
            it('should call Me.Patch to empty array when no favoriteProducts xp', function(){
                delete directiveScope.currentUser.xp.FavoriteProducts;
                directiveScope.checkHasFavorites();
                expect(oc.Me.Patch).toHaveBeenCalledWith({xp: mock.User.xp});
            });
        });
        describe('when clicked', function(){
            beforeEach(function(){
                var defer = q.defer();
                defer.resolve({xp: {FavoriteProducts: mock.Product.ID}})
                spyOn(oc.Me, 'Patch').and.returnValue(defer.promise);
            });
            it('should add to favorites if user doesnt have any favorite products', function(){
                directiveScope.hasFavorites = false;
                element.triggerHandler('click');
                expect(oc.Me.Patch).toHaveBeenCalledWith({xp: {FavoriteProducts: [mock.Product.ID]}});
                scope.$digest();
                expect(directiveScope.hasFavorites).toBe(mock.Product.ID);
            });
            it('should add to favorites if user has favorites but favorited class isnt active', function(){
                directiveScope.hasFavorites = true;
                element.addClass(unfavedClass);
                element.removeClass(favedClass);

                element.triggerHandler('click');
                expect(oc.Me.Patch).toHaveBeenCalledWith({xp:{FavoriteProducts: mock.User.xp.FavoriteProducts}})
                scope.$digest();
                expect(element.hasClass(favedClass)).toBe(true);
            });
            it('should remove from favorites if user has favorites but favorited class is active', function(){
                directiveScope.hasFavorites = true;
                element.addClass(favedClass);
                element.removeClass(unfavedClass);
                directiveScope.currentUser.xp.FavoriteProducts = addedFaves; //adds product to favorites array

                element.triggerHandler('click');
                expect(oc.Me.Patch).toHaveBeenCalledWith({xp:{FavoriteProducts: originalFaves}});
                scope.$digest();
                expect(element.hasClass(unfavedClass)).toBe(true);
            });
        });
    });

    describe('Controller: FavoriteProductsCtrl', function(){
        var favoriteProductsCtrl,
        products;
        beforeEach(inject(function($controller){
            scope.currentUser = mock.User;
            favoriteProducts = {Items: [mock.Product], Meta: mock.Meta}
            favoriteProductsCtrl = $controller('FavoriteProductsCtrl', {
                CurrentUser: currentUser,
                FavoriteProducts: favoriteProducts
            });
        }));
        describe('filter', function(){
            beforeEach(function(){
                spyOn(state, 'go');
                spyOn(ocParametersService, 'Create').and.callThrough();
                favoriteProductsCtrl.filter(true);
            })
            it('should reload state with new parameters', function(){
                expect(ocParametersService.Create).toHaveBeenCalledWith(parametersResolve, true);
                var createdParams = ocParametersService.Create(parametersResolve, true);
                expect(createdParams).toBeDefined();
                expect(state.go).toHaveBeenCalledWith('.', createdParams);
            })
        });
        describe('clearFilters', function(){
            beforeEach(function(){
                spyOn(favoriteProductsCtrl, 'filter');
                favoriteProductsCtrl.clearFilters();
            });
            it('should call clear filters, reload state and reset page', function(){
                expect(favoriteProductsCtrl.parameters.filters).toBeNull();
                expect(favoriteProductsCtrl.filter).toHaveBeenCalledWith(true);
            });
        });
        describe('updateSort', function(){
            var mockVal = 'MOCK_VAL';
            beforeEach(function(){
                spyOn(favoriteProductsCtrl, 'filter');
            });
            it('if value passed in is equal to sortBy - set to !value', function(){
                favoriteProductsCtrl.parameters.sortBy = mockVal;
                favoriteProductsCtrl.updateSort(mockVal);

                expect(favoriteProductsCtrl.parameters.sortBy).toBeDefined();
                expect(favoriteProductsCtrl.parameters.sortBy).toBe('!' + mockVal);
            });
            it('if value passed in is equal to !sortBy - set to null', function(){
                favoriteProductsCtrl.parameters.sortBy = '!' + mockVal;
                favoriteProductsCtrl.updateSort(mockVal);

                expect(favoriteProductsCtrl.parameters.sortBy).toBeDefined();
                expect(favoriteProductsCtrl.parameters.sortBy).toBe(null);
            });
            it('if no value is passed in, set it to sortSelection', function(){
                var mockSelection = 'SORT_SELECTION';
                favoriteProductsCtrl.sortSelection = mockSelection;
                favoriteProductsCtrl.updateSort();

                expect(favoriteProductsCtrl.parameters.sortBy).toBeDefined();
                expect(favoriteProductsCtrl.parameters.sortBy).toBe(mockSelection);
            });
            it('should reload state with new filters - same page', function(){
                favoriteProductsCtrl.updateSort();
                expect(favoriteProductsCtrl.filter).toHaveBeenCalledWith(false);
            })
        });
        describe('reverseSort', function(){
            var mockVal;
            beforeEach(function(){
                mockVal = 'MOCK_VALUE';
                spyOn(favoriteProductsCtrl, 'filter');
            })
            it('should reverse sort - ascending to descending', function(){
                favoriteProductsCtrl.parameters.sortBy = mockVal;
                favoriteProductsCtrl.reverseSort();
                expect(favoriteProductsCtrl.parameters.sortBy).toBe('!' + mockVal);
            })
            it('should reverse sort - descending to ascending', function(){
                favoriteProductsCtrl.parameters.sortBy = '!' + mockVal;
                favoriteProductsCtrl.reverseSort();
                expect(favoriteProductsCtrl.parameters.sortBy).toBe(mockVal);
            })
            it('should reload state with new filters - same page', function(){
                favoriteProductsCtrl.reverseSort();
                expect(favoriteProductsCtrl.filter).toHaveBeenCalledWith(false);
            })
        });
        describe('pageChanged', function(){
            it('should reload state with page defined on Meta', function(){
                spyOn(state, 'go');
                favoriteProductsCtrl.pageChanged();
                expect(state.go).toHaveBeenCalledWith('.', {page: favoriteProductsCtrl.list.Meta.Page});
            })
        })
        describe('loadMore', function(){
            it('should call oc.Me.ListProducts with incremented page parameter', function(){
                spyOn(oc.Me, 'ListProducts').and.returnValue(dummyPromise);
                favoriteProductsCtrl.loadMore();
                favoriteProductsCtrl.parameters.page = favoriteProductsCtrl.list.Meta.Page + 1;
                expect(oc.Me.ListProducts).toHaveBeenCalledWith(favoriteProductsCtrl.parameters)
            })
        })
    });
});