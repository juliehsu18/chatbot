
$(document).ready(function() {
    // Hamburger Menu Interaction
    $('#btnHamburger').on('click', function() {
        const menu = $('#hamburgerMenu');
        const isExpanded = menu.is(':visible');
        
        if (isExpanded) {
            menu.slideUp(200);
            $(this).attr('aria-expanded', 'false');
            menu.attr('aria-hidden', 'true');
            $(this).attr('aria-label', '開啟選單');
            $(this).removeClass('is-active');
        } else {
            menu.slideDown(200);
            $(this).attr('aria-expanded', 'true');
            menu.attr('aria-hidden', 'false');
            $(this).attr('aria-label', '關閉選單');
            $(this).addClass('is-active');
        }
    });

    // Close Menu when clicking Agree
    $('#agreeBtn').on('click', function() {
        $('#hamburgerMenu').slideUp(200);
        $('#btnHamburger').attr('aria-expanded', 'false').attr('aria-label', '開啟選單').removeClass('is-active');
        $('#hamburgerMenu').attr('aria-hidden', 'true');
    });

    // Remove Announce Block Completely
    $('#btnCloseAnnounce').on('click', function() {
        $('#announceBlock').remove();
    });

    // Expand Button Interaction
    $('#btnExpand').on('click', function() {
        $(this).toggleClass('is-active');
        if ($(this).hasClass('is-active')) {
            $(this).attr('aria-label', '收起附加功能');
            $('#actionPanel').slideDown(250);
        } else {
            $(this).attr('aria-label', '展開附加功能');
            $('#actionPanel').slideUp(250);
        }
    });

    // Lazy load implementation using IntersectionObserver
    if ('IntersectionObserver' in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = $(entry.target);
                    lazyImage.attr('src', lazyImage.attr('data-src'));
                    lazyImage.removeClass('lazyload');
                    lazyImageObserver.unobserve(lazyImage[0]);
                }
            });
        });

        $('.lazyload').each(function() {
            lazyImageObserver.observe(this);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        $('.lazyload').each(function() {
            $(this).attr('src', $(this).attr('data-src'));
            $(this).removeClass('lazyload');
        });
    }

    // Transaction Detail Expansion
    $(document).on('click', '.transaction-item-header', function() {
        const item = $(this).closest('.transaction-item');
        const chevron = item.find('.transaction-chevron');
        item.toggleClass('expanded');
        item.find('.transaction-detail').slideToggle(300);
    });

    // Filter Dropdown Logic
    const filterOptions = {
        card: ["熊本熊卡", "Unicard", "世界卡", "悠遊聯名卡"],
        holder: ["正卡", "附卡"],
        currency: ["TWD", "JPY", "USD", "EUR"]
    };

    const filterDefaults = {
        card: "卡別",
        holder: "正附卡",
        date: "日期",
        currency: "幣別"
    };

    // Toggle Dropdown
    $(document).on('click', '.filter-pill:not(#clearFilters, [data-type="date"])', function(e) {
        e.stopPropagation();
        const type = $(this).data('type');
        $('.filter-dropdown').remove(); // Close existing

        const dropdown = $('<div class="filter-dropdown"></div>');
        filterOptions[type].forEach(opt => {
            dropdown.append(`<div class="dropdown-option" data-value="${opt}">${opt}</div>`);
        });

        $(this).after(dropdown);
        dropdown.fadeIn(200);

        // Handle option selection
        const pill = $(this);
        dropdown.find('.dropdown-option').on('click', function(e) {
            e.stopPropagation();
            const val = $(this).data('value');
            pill.addClass('active');
            pill.find('.pill-text').text(val);
            dropdown.fadeOut(200, function() { $(this).remove(); });
            filterTransactions();
        });
    });

    // Date Picker Logic
    $(document).on('click', '.filter-pill[data-type="date"]', function() {
        $('#datePickerOverlay').css('display', 'flex').hide().fadeIn(200);
    });

    $('#cancelDatePicker').on('click', function() {
        $('#datePickerOverlay').fadeOut(200);
    });

    $('#confirmDatePicker').on('click', function() {
        const start = $('#startDate').val();
        const end = $('#endDate').val();
        if (start && end) {
            const pill = $('.filter-pill[data-type="date"]');
            pill.addClass('active');
            // Format date to mm/dd
            const s = start.split('-').slice(1).join('/');
            const e = end.split('-').slice(1).join('/');
            pill.find('.pill-text').text(`${s}-${e}`);
            $('#datePickerOverlay').fadeOut(200);
            filterTransactions();
        } else {
            alert('請選擇完整日期區間');
        }
    });

    // Close dropdowns on click outside
    $(document).on('click', function() {
        $('.filter-dropdown').fadeOut(200, function() { $(this).remove(); });
    });

    // Pill Close (Reset)
    $(document).on('click', '.pill-close', function(e) {
        e.stopPropagation();
        const pill = $(this).closest('.filter-pill');
        const type = pill.data('type');
        pill.removeClass('active');
        pill.find('.pill-text').text(filterDefaults[type]);
        filterTransactions();
    });

    $('#clearFilters').on('click', function() {
        $('.filter-pill').each(function() {
            const type = $(this).data('type');
            if (type) {
                $(this).removeClass('active');
                $(this).find('.pill-text').text(filterDefaults[type]);
            }
        });
        $('#transactionSearchInput').val('');
        filterTransactions();
    });

    // Unified filter function
    function filterTransactions() {
        const searchVal = $('#transactionSearchInput').val().toLowerCase();
        
        $('.transaction-item').each(function() {
            const name = $(this).data('name').toLowerCase();
            const amountText = $(this).find('.transaction-amount').text().replace(/[^-0-9.]/g, '');
            
            let show = true;

            // Search check
            if (searchVal && !name.includes(searchVal) && !amountText.includes(searchVal)) {
                show = false;
            }

            // Card Filter check
            const cardPill = $('.filter-pill[data-type="card"]');
            if (cardPill.hasClass('active')) {
                const selected = cardPill.find('.pill-text').text();
                const itemCard = $(this).find('.transaction-detail-val').first().text(); 
                // Note: In a real app we'd have better data attributes, here we mock the check
                if (!itemCard.includes(selected) && name !== "熊本熊卡國內消費1%現金回饋") { // Hardcoded mock condition
                    // show = false; // Simplified for demo
                }
            }

            if (show) $(this).show(); else $(this).hide();
        });
    }

    // Transaction Search
    $('#transactionSearchInput').on('keyup', filterTransactions);

    // Self-input Amount Logic
    $('#selfInputAmount').on('input', function() {
        const rawVal = $(this).val().replace(/[^0-9]/g, '');
        $(this).val(rawVal); // Keep only numbers
        
        const amount = parseInt(rawVal, 10);
        const btnStore = $('#btnStorePay');
        const btnOnline = $('#btnOnlinePay');
        
        if (rawVal && !isNaN(amount)) {
            btnOnline.show();
            if (amount <= 20000) {
                btnStore.show().css('border-bottom', '1px solid #e1efef');
                btnOnline.css('border-bottom', 'none');
            } else {
                btnStore.hide();
                btnOnline.css('border-bottom', 'none');
            }
        } else {
            btnStore.hide();
            btnOnline.hide();
        }
    });

    // Barcode Download Pop-up Logic
    $('#btnDownloadBarcode').on('click', function() {
        $('#downloadSuccessOverlay').css('display', 'flex').hide().fadeIn(200);
    });

    $('#confirmDownload').on('click', function() {
        $('#downloadSuccessOverlay').fadeOut(200);
    });
});


$(function () {
  function playBotTyping($msgContent) {
    const $typing = $msgContent.find('.typing-bubble').first();
    const $items = $msgContent.children().not('.typing-bubble');

    // 先把除了 typing 以外的內容全部藏起來
    $items.hide();

    // typing 先顯示
    $typing.show();

    // 停留 2 秒後，typing 消失，其餘內容依序浮出
    setTimeout(function () {
      $typing.fadeOut(200, function () {
        let index = 0;

        function showNext() {
          if (index < $items.length) {
            $items.eq(index).fadeIn(400, function () {
              index++;
              showNext();
            });
          }
        }

        showNext();
      });
    }, 2000);
  }

  // 初始化所有 bot 訊息
  $('.msg-row.bot .msg-content').each(function () {
    playBotTyping($(this));
  });
});



$(function () {
    let flowTimers = [];

    function addTimer(callback, delay) {
        const timer = setTimeout(callback, delay);
        flowTimers.push(timer);
        return timer;
    }

    function clearAllTimers() {
        flowTimers.forEach(function (timer) {
            clearTimeout(timer);
        });
        flowTimers = [];
    }

    function showLoading() {
        $('#loadingOverlay').fadeIn(200);
    }

    function hideLoading() {
        $('#loadingOverlay').fadeOut(200);
    }

    function showImageOverlay() {
        $('#imageOverlay').fadeIn(200);
    }

    function hideImageOverlay() {
        $('#imageOverlay').fadeOut(200);
    }

    function scrollChatToBottom() {
        const $chat = $('.chat-container');
        $chat.stop().animate({
            scrollTop: $chat[0].scrollHeight
        }, 300);
    }

    function prepareBotRow($row) {
        const $content = $row.find('.msg-content');
        const $typing = $content.children('.typing-bubble');
        const $others = $content.children().not('.typing-bubble');

        $typing.hide();
        $others.hide();
    }

    function showUserRow(rowId) {
        const $row = $(rowId);
    
        $row
            .removeClass('is-hidden')
            .css('display', 'flex')
            .hide()
            .fadeIn(200, function () {
                $(this).css('display', 'flex');
                scrollChatToBottom();
            });
    }

    function playBotRow(rowId, callback, typingDelay = 800) {
        const $row = $(rowId);
        const $content = $row.find('.msg-content');
        const $typing = $content.children('.typing-bubble');
        const $others = $content.children().not('.typing-bubble');
    
        $typing.hide();
        $others.hide();
    
        $row
            .removeClass('is-hidden')
            .css('display', 'flex')
            .hide()
            .fadeIn(200, function () {
                $(this).css('display', 'flex');
    
                $typing.fadeIn(150, function () {
                    // scrollChatToBottom();
                    scrollToRowTop($row);
    
                    addTimer(function () {
                        $typing.fadeOut(150, function () {
                            $others.fadeIn(200, function () {
                                // scrollChatToBottom();
                                scrollToRowTop($row);
                                if (typeof callback === 'function') {
                                    callback();
                                }
                            });
                        });
                    }, typingDelay);
                });
            });
    }

    function resetFlow() {
        clearAllTimers();

        hideLoading();
        hideImageOverlay();

        $('.chat-container .msg-row').hide();

        $('.chat-container .msg-row.bot').each(function () {
            prepareBotRow($(this));
        });

        $('#hamburgerMenu').show().attr('aria-hidden', 'false');
        $('#btnHamburger').attr('aria-expanded', 'true');
        $('#agreeBtn').show();

        scrollChatToBottom();
    }

    function startFlow() {
        $('#hamburgerMenu').fadeOut(200, function () {
            $(this).attr('aria-hidden', 'true');
            $('#btnHamburger').attr('aria-expanded', 'false');

            playBotRow('#botMsg1');
        });
    }

    function bindFlowEvents() {
        $('#agreeBtn').off('click').on('click', function () {
            $(this).hide(); 
            startFlow();
        });

        $('#cardBillDetailBtn').off('click').on('click', function () {
            if (!$('#botMsg1').is(':visible') || $('#userMsg1').is(':visible')) return;

            showUserRow('#userMsg1');

            addTimer(function () {
                playBotRow('#botMsg2');
            }, 300);
        });

        $('#currentBillBtn').off('click').on('click', function () {
            if (!$('#botMsg2').is(':visible') || $('#userMsg2').is(':visible')) return;

            showUserRow('#userMsg2');

            addTimer(function () {
                playBotRow('#botMsg3');
            }, 300);
        });

        $('#appVerifyBtn').off('click').on('click', function () {
            if (!$('#botMsg3').is(':visible') || $('#userMsg3').is(':visible')) return;

            showUserRow('#userMsg3');

            addTimer(function () {
                playBotRow('#botMsg4', function () {
                    addTimer(function () {
                        showLoading();

                        addTimer(function () {
                            hideLoading();
                            showImageOverlay();

                            addTimer(function () {
                                hideImageOverlay();
                                playBotRow('#botMsg5');
                            }, 3000);

                        }, 1000);

                    }, 300);
                }, 500);
            }, 300);
        });

        $('#paymentRecordBtn').off('click').on('click', function () {
            if (!$('#botMsg5').is(':visible') || $('#userMsg5').is(':visible')) return;

            showUserRow('#userMsg5');

            addTimer(function () {
                playBotRow('#botMsg6');
            }, 300);
        });

        $('#statementDetailBtn').off('click').on('click', function () {
            if (!$('#botMsg6').is(':visible') || $('#userMsg6').is(':visible')) return;

            showUserRow('#userMsg6');

            addTimer(function () {
                playBotRow('#botMsg7');
            }, 300);
        });

        $('#payNowBtn').off('click').on('click', function () {
            if (!$('#botMsg7').is(':visible') || $('#userMsg7').is(':visible')) return;

            showUserRow('#userMsg7');

            addTimer(function () {
                playBotRow('#botMsg8');
            }, 300);
        });

        $('#barcodePayBtn').off('click').on('click', function () {
            if (!$('#botMsg8').is(':visible') || $('#userMsg8').is(':visible')) return;

            showUserRow('#userMsg8');

            addTimer(function () {
                playBotRow('#botMsg9');
            }, 300);
        });

        $('#logoutBtn').off('click').on('click', function () {
            resetFlow();
        });
    }

    // 初始化
    $('.chat-container .msg-row.bot').each(function () {
        prepareBotRow($(this));
    });

    bindFlowEvents();
    resetFlow();
});


$(function () {
    var $marqueeList = $('.marquee-list');
    var $wrap = $('.marquee-wrap');
    var interval;
    var speed = 400;
    var delay = 5000;

    function moveMarquee() {
        var itemHeight = $wrap.height();

        $marqueeList.animate(
            { marginTop: -itemHeight },
            speed,
            function () {
                $marqueeList.append($marqueeList.find('.marquee-item').first());
                $marqueeList.css('marginTop', 0);
            }
        );
    }

    interval = setInterval(moveMarquee, delay);

    // 滑鼠移入暫停，移出繼續
    $('#announceBlock .message').on('mouseenter', function () {
        clearInterval(interval);
    }).on('mouseleave', function () {
        interval = setInterval(moveMarquee, delay);
    });
});

$(function () {
    $('.scroll-area').each(function () {
        var $area = $(this);
        var $container = $area.find('.scroll-wrapper, .payment-scroll-container').first();
        var $leftBtn = $area.find('.scroll-nav-left');
        var $rightBtn = $area.find('.scroll-nav-right');

        function getCardStep() {
            var $card = $container.find('.scroll-card, .payment-card').first();
            if (!$card.length) return 208; // fallback
            var cardWidth = $card.outerWidth();
            var gap = parseInt($container.css('gap')) || 0;
            return cardWidth + gap;
        }

        function updateNav() {
            var el = $container[0];
            if (!el) return;

            var maxScrollLeft = el.scrollWidth - el.clientWidth;
            var currentScroll = el.scrollLeft;

            if (currentScroll <= 2) {
                $leftBtn.addClass('is-hidden');
            } else {
                $leftBtn.removeClass('is-hidden');
            }

            if (currentScroll >= maxScrollLeft - 2) {
                $rightBtn.addClass('is-hidden');
            } else {
                $rightBtn.removeClass('is-hidden');
            }
        }

        $rightBtn.on('click', function () {
            var step = getCardStep();
            $container.stop().animate({
                scrollLeft: $container.scrollLeft() + step
            }, 300, updateNav);
        });

        $leftBtn.on('click', function () {
            var step = getCardStep();
            $container.stop().animate({
                scrollLeft: $container.scrollLeft() - step
            }, 300, updateNav);
        });

        $container.on('scroll', updateNav);
        $(window).on('resize', updateNav);

        updateNav();
    });
});

function scrollToRowTop($row) {
    const $chat = $('.chat-container');

    $chat.stop().animate({
        scrollTop: $chat.scrollTop() + $row.position().top
    }, 300);
}


